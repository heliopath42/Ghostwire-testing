package nat

import (
	"fmt"
	"net"
)

// Proxy sits between WireGuard and the network.
type Proxy struct {
	localConn  *net.UDPConn
	publicConn *net.UDPConn

	wireGuardAddr *net.UDPAddr
	peer          *Peer
}

// NewProxy creates the UDP sockets used by the proxy.
func NewProxy(
	localAddr string,
	publicAddr string,
	wireGuardAddr string,
	peer *Peer,
) (*Proxy, error) {

	localUDPAddr, err := net.ResolveUDPAddr("udp", localAddr)
	if err != nil {
		return nil, fmt.Errorf("invalid local address: %w", err)
	}

	localConn, err := net.ListenUDP("udp", localUDPAddr)
	if err != nil {
		return nil, fmt.Errorf("failed to listen locally: %w", err)
	}

	publicUDPAddr, err := net.ResolveUDPAddr("udp", publicAddr)
	if err != nil {
		localConn.Close()
		return nil, fmt.Errorf("invalid public address: %w", err)
	}

	publicConn, err := net.ListenUDP("udp", publicUDPAddr)
	if err != nil {
		localConn.Close()
		return nil, fmt.Errorf("failed to listen publicly: %w", err)
	}

	wgAddr, err := net.ResolveUDPAddr("udp", wireGuardAddr)
	if err != nil {
		localConn.Close()
		publicConn.Close()
		return nil, fmt.Errorf("invalid WireGuard address: %w", err)
	}

	return &Proxy{
		localConn:     localConn,
		publicConn:    publicConn,
		wireGuardAddr: wgAddr,
		peer:          peer,
	}, nil
}


// Start begins forwarding packets.
func (p *Proxy) Start() {
	go p.forwardToPeer()
	go p.forwardToWireGuard()
}


// WireGuard -> Internet
func (p *Proxy) forwardToPeer() {

	buffer := make([]byte, 65535)

	for {

		n, _, err := p.localConn.ReadFromUDP(buffer)

		if err != nil {
			return
		}

		if p.peer == nil || p.peer.PublicAddr == nil {
			continue
		}


		_, err = p.publicConn.WriteToUDP(
			buffer[:n],
			p.peer.PublicAddr,
		)

		if err != nil {
			continue
		}
	}
}


// Internet -> WireGuard
func (p *Proxy) forwardToWireGuard() {

	buffer := make([]byte, 65535)

	for {

		n, addr, err := p.publicConn.ReadFromUDP(buffer)

		if err != nil {
			return
		}


		fmt.Println(
			"Received UDP packet from:",
			addr,
			"size:",
			n,
			"data:",
			string(buffer[:n]),
		)


		// NAT punch packet
		if string(buffer[:n]) == "ghostwire-punch" {

			fmt.Println(
				"NAT hole punched with:",
				addr,
			)

			continue
		}


		// Normal WireGuard packet
		_, err = p.localConn.WriteToUDP(
			buffer[:n],
			p.wireGuardAddr,
		)

		if err != nil {
			continue
		}
	}
}


// Close closes sockets.
func (p *Proxy) Close() error {

	var firstErr error


	if p.localConn != nil {

		if err := p.localConn.Close(); err != nil {
			firstErr = err
		}
	}


	if p.publicConn != nil {

		if err := p.publicConn.Close(); err != nil && firstErr == nil {
			firstErr = err
		}
	}


	return firstErr
}