//go:build linux

// Package wireguard configures a native Linux kernel WireGuard interface.
// It has no knowledge of CLI flags, hardcoded keys, or a coordination
// server — callers supply fully-resolved Config values.
package wireguard

import (
	"errors"
	"fmt"
	"net"
	"time"

	"github.com/vishvananda/netlink"
	"golang.zx2c4.com/wireguard/wgctrl"
	"golang.zx2c4.com/wireguard/wgctrl/wgtypes"
)

// PeerConfig describes one WireGuard peer.
type PeerConfig struct {
	PublicKey wgtypes.Key

	// Endpoint is the peer's physical/LAN address, e.g. 192.168.1.20:51820.
	// Nil if the endpoint is not yet known (e.g. pending NAT traversal).
	Endpoint *net.UDPAddr

	// AllowedIPs are Ghostwire virtual IPs/CIDRs this peer is permitted for,
	// e.g. 10.0.0.2/32. Never physical/LAN addresses.
	AllowedIPs []net.IPNet

	PersistentKeepaliveInterval *time.Duration
}

func (p PeerConfig) toWG() wgtypes.PeerConfig {
	return wgtypes.PeerConfig{
		PublicKey:                   p.PublicKey,
		Endpoint:                    p.Endpoint,
		AllowedIPs:                  p.AllowedIPs,
		PersistentKeepaliveInterval: p.PersistentKeepaliveInterval,
		ReplaceAllowedIPs:           true,
	}
}

// Config fully specifies one node's WireGuard setup. It carries no
// defaults and reads nothing from the environment.
type Config struct {
	InterfaceName string // e.g. "wg0"
	PrivateKey    wgtypes.Key
	ListenPort    int

	// GhostwireIP is this node's own virtual address assigned to the
	// interface itself, e.g. 10.0.0.1/32. Never the physical/LAN address.
	GhostwireIP net.IPNet

	Peers []PeerConfig
}

func (c Config) validate() error {
	if c.InterfaceName == "" {
		return errors.New("wireguard: InterfaceName is required")
	}
	if c.PrivateKey == (wgtypes.Key{}) {
		return errors.New("wireguard: PrivateKey is required")
	}
	if c.GhostwireIP.IP == nil {
		return errors.New("wireguard: GhostwireIP is required")
	}
	return nil
}

// Manager owns one WireGuard interface's lifecycle: creation, peer
// configuration, routing, and teardown.
type Manager struct {
	cfg    Config
	client *wgctrl.Client
	link   netlink.Link
}

// New validates cfg and opens a handle to the kernel WireGuard control
// interface. It does not touch network interfaces yet — call Up for that.
func New(cfg Config) (*Manager, error) {
	if err := cfg.validate(); err != nil {
		return nil, err
	}
	client, err := wgctrl.New()
	if err != nil {
		return nil, fmt.Errorf("wireguard: opening wgctrl client: %w", err)
	}
	return &Manager{cfg: cfg, client: client}, nil
}

// Up creates (idempotently) the interface, assigns the Ghostwire IP,
// brings the link up, applies the private key/listen port/initial peers,
// and installs an OS route for every peer's AllowedIPs pointing at this
// interface. If an interface with the same name already exists it is
// deleted first, so this is safe to call after an unclean shutdown.
func (m *Manager) Up() error {
	if existing, err := netlink.LinkByName(m.cfg.InterfaceName); err == nil {
		if err := netlink.LinkDel(existing); err != nil {
			return fmt.Errorf("wireguard: removing existing interface %s: %w", m.cfg.InterfaceName, err)
		}
	}

	link := &netlink.Wireguard{
		LinkAttrs: netlink.LinkAttrs{Name: m.cfg.InterfaceName},
	}
	if err := netlink.LinkAdd(link); err != nil {
		return fmt.Errorf("wireguard: creating interface %s: %w", m.cfg.InterfaceName, err)
	}
	m.link = link

	ghostIP := m.cfg.GhostwireIP // local copy; AddrAdd takes a pointer
	if err := netlink.AddrAdd(link, &netlink.Addr{IPNet: &ghostIP}); err != nil {
		return fmt.Errorf("wireguard: assigning %s to %s: %w", ghostIP.String(), m.cfg.InterfaceName, err)
	}

	if err := netlink.LinkSetUp(link); err != nil {
		return fmt.Errorf("wireguard: bringing up %s: %w", m.cfg.InterfaceName, err)
	}

	peers := make([]wgtypes.PeerConfig, 0, len(m.cfg.Peers))
	for _, p := range m.cfg.Peers {
		peers = append(peers, p.toWG())
	}

	privKey := m.cfg.PrivateKey
	listenPort := m.cfg.ListenPort
	devCfg := wgtypes.Config{
		PrivateKey:   &privKey,
		ListenPort:   &listenPort,
		ReplacePeers: true,
		Peers:        peers,
	}
	if err := m.client.ConfigureDevice(m.cfg.InterfaceName, devCfg); err != nil {
		return fmt.Errorf("wireguard: configuring device %s: %w", m.cfg.InterfaceName, err)
	}

	// The kernel WireGuard module only maintains its own internal
	// cryptokey routing (which peer to encrypt a packet for). It does
	// NOT touch the OS routing table — that's normally wg-quick's job,
	// and since we bypass wg-quick, we do it explicitly here.
	for _, p := range m.cfg.Peers {
		if err := m.addPeerRoutes(p); err != nil {
			return err
		}
	}

	return nil
}

// AddPeer adds or updates a single peer and installs OS routes for its
// AllowedIPs, without touching the rest of the device's peer set.
func (m *Manager) AddPeer(p PeerConfig) error {
	cfg := wgtypes.Config{Peers: []wgtypes.PeerConfig{p.toWG()}}
	if err := m.client.ConfigureDevice(m.cfg.InterfaceName, cfg); err != nil {
		return fmt.Errorf("wireguard: adding peer %s: %w", p.PublicKey.String(), err)
	}
	return m.addPeerRoutes(p)
}

// RemovePeer removes a peer from the device and deletes the OS routes
// that were installed for its AllowedIPs. It takes the full PeerConfig
// (not just a public key) because route deletion needs to know exactly
// which AllowedIPs to remove.
func (m *Manager) RemovePeer(p PeerConfig) error {
	cfg := wgtypes.Config{
		Peers: []wgtypes.PeerConfig{{PublicKey: p.PublicKey, Remove: true}},
	}
	if err := m.client.ConfigureDevice(m.cfg.InterfaceName, cfg); err != nil {
		return fmt.Errorf("wireguard: removing peer %s: %w", p.PublicKey.String(), err)
	}
	return m.delPeerRoutes(p)
}

// addPeerRoutes installs an on-link route for each of a peer's
// AllowedIPs, pointing at this interface — equivalent to
// `ip route add <cidr> dev wg0`.
func (m *Manager) addPeerRoutes(p PeerConfig) error {
	for _, allowedIP := range p.AllowedIPs {
		dst := allowedIP
		route := &netlink.Route{
			LinkIndex: m.link.Attrs().Index,
			Dst:       &dst,
			Scope:     netlink.SCOPE_LINK,
		}
		if err := netlink.RouteAdd(route); err != nil {
			return fmt.Errorf("wireguard: adding route %s via %s: %w", dst.String(), m.cfg.InterfaceName, err)
		}
	}
	return nil
}

// delPeerRoutes removes the routes previously installed by addPeerRoutes
// for a peer's AllowedIPs.
func (m *Manager) delPeerRoutes(p PeerConfig) error {
	var errs []error
	for _, allowedIP := range p.AllowedIPs {
		dst := allowedIP
		route := &netlink.Route{
			LinkIndex: m.link.Attrs().Index,
			Dst:       &dst,
			Scope:     netlink.SCOPE_LINK,
		}
		if err := netlink.RouteDel(route); err != nil {
			errs = append(errs, fmt.Errorf("wireguard: removing route %s: %w", dst.String(), err))
		}
	}
	return errors.Join(errs...)
}

// Close tears down the interface and releases the wgctrl handle. Safe to
// call even if Up failed partway through. Deleting the link implicitly
// removes every route that referenced it, so no separate route cleanup
// is needed here.
func (m *Manager) Close() error {
	var errs []error
	if m.link != nil {
		if err := netlink.LinkDel(m.link); err != nil {
			errs = append(errs, fmt.Errorf("wireguard: deleting interface: %w", err))
		}
	}
	if m.client != nil {
		if err := m.client.Close(); err != nil {
			errs = append(errs, fmt.Errorf("wireguard: closing wgctrl client: %w", err))
		}
	}
	return errors.Join(errs...)
}
