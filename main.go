package main

import (
	"context"
	"flag"
	"log"
	"net"
	"os/signal"
	"syscall"
	"time"

	"github.com/devlup-labs/Ghostwire/client-backend/wireguard"
	"golang.zx2c4.com/wireguard/wgctrl/wgtypes"
)

const (
	ifaceName  = "wg0"
	listenPort = 51820
	keepalive  = 25 * time.Second

	nodeAPrivateKey = "+xJsNSFOzjPMLbZtByGRWEIOWTtEiYynZVlms1mG1Ks="
	nodeAPublicKey  = "x0jlpgGMh9rmh3z4pGX412wIquco0e/CbuIWrPpUehU="
	nodeALANIP      = "192.168.1.20"
	nodeAGhostCIDR  = "10.0.0.1/32"

	nodeBPrivateKey = "HixmzeoEwNTjWtbnxTr0iuoop5Xfo156DrXqpCEGMrM="
	nodeBPublicKey  = "M+ZXlfJJz4KorDCGLEpVNBA6Rm5nEDytf4k95nzZShQ="
	nodeBLANIP      = "192.168.1.21"
	nodeBGhostCIDR  = "10.0.0.2/32"
)

func mustParseGhostwireCIDR(cidr string) net.IPNet {
	ip, ipNet, err := net.ParseCIDR(cidr)
	if err != nil {
		log.Fatalf("parsing ghostwire CIDR %s: %v", cidr, err)
	}
	ipNet.IP = ip // keep the host address, not ParseCIDR's masked network address
	return *ipNet
}

func mustParseKey(b64 string) wgtypes.Key {
	k, err := wgtypes.ParseKey(b64)
	if err != nil {
		log.Fatalf("parsing key: %v", err)
	}
	return k
}

func main() {
	node := flag.String("node", "", "which node to run: A or B")
	flag.Parse()

	var (
		privKeyStr, ghostCIDR                   string
		peerPubKeyStr, peerLANIP, peerGhostCIDR string
	)

	switch *node {
	case "A":
		privKeyStr, ghostCIDR = nodeAPrivateKey, nodeAGhostCIDR
		peerPubKeyStr, peerLANIP, peerGhostCIDR = nodeBPublicKey, nodeBLANIP, nodeBGhostCIDR
	case "B":
		privKeyStr, ghostCIDR = nodeBPrivateKey, nodeBGhostCIDR
		peerPubKeyStr, peerLANIP, peerGhostCIDR = nodeAPublicKey, nodeALANIP, nodeAGhostCIDR
	default:
		log.Fatal("must specify -node A or -node B")
	}

	peerEndpoint := &net.UDPAddr{IP: net.ParseIP(peerLANIP), Port: listenPort}
	peerGhostIPNet := mustParseGhostwireCIDR(peerGhostCIDR)
	ka := keepalive

	cfg := wireguard.Config{
		InterfaceName: ifaceName,
		PrivateKey:    mustParseKey(privKeyStr),
		ListenPort:    listenPort,
		GhostwireIP:   mustParseGhostwireCIDR(ghostCIDR),
		Peers: []wireguard.PeerConfig{
			{
				PublicKey:                   mustParseKey(peerPubKeyStr),
				Endpoint:                    peerEndpoint,
				AllowedIPs:                  []net.IPNet{peerGhostIPNet},
				PersistentKeepaliveInterval: &ka,
			},
		},
	}

	mgr, err := wireguard.New(cfg)
	if err != nil {
		log.Fatalf("creating manager: %v", err)
	}

	if err := mgr.Up(); err != nil {
		log.Fatalf("bringing up interface: %v", err)
	}
	log.Printf("node %s up: %s = %s, peer endpoint = %s", *node, ifaceName, ghostCIDR, peerEndpoint)

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
	<-ctx.Done()

	log.Println("signal received, tearing down...")
	if err := mgr.Close(); err != nil {
		log.Fatalf("teardown error: %v", err)
	}
	log.Println("clean shutdown complete")
}
