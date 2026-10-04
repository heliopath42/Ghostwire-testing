package nat

import (
	"net"
	"testing"
)

func TestNewProxy(t *testing.T) {
	peer := &Peer{DeviceID: "peer-1"}

	p, err := NewProxy(
		"127.0.0.1:0",
		"127.0.0.1:0",
		"127.0.0.1:51820",
		peer,
	)
	if err != nil {
		t.Fatalf("NewProxy() returned error: %v", err)
	}
	defer p.Close()

	if p.localConn == nil {
		t.Fatal("localConn is nil")
	}
	if p.publicConn == nil {
		t.Fatal("publicConn is nil")
	}
	if p.wireGuardAddr == nil {
		t.Fatal("wireGuardAddr is nil")
	}
	if p.peer != peer {
		t.Fatal("peer was not stored correctly")
	}
}

func TestNewProxyInvalidAddresses(t *testing.T) {
	tests := []struct {
		name       string
		localAddr  string
		publicAddr string
		wgAddr     string
	}{
		{"invalid local address", "bad-address", "127.0.0.1:0", "127.0.0.1:51820"},
		{"invalid public address", "127.0.0.1:0", "bad-address", "127.0.0.1:51820"},
		{"invalid WireGuard address", "127.0.0.1:0", "127.0.0.1:0", "bad-address"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			p, err := NewProxy(tt.localAddr, tt.publicAddr, tt.wgAddr, nil)
			if err == nil {
				if p != nil {
					p.Close()
				}
				t.Fatal("expected an error")
			}
		})
	}
}

func TestUpdatePeer(t *testing.T) {
	p, err := NewProxy(
		"127.0.0.1:0",
		"127.0.0.1:0",
		"127.0.0.1:51820",
		nil,
	)
	if err != nil {
		t.Fatalf("NewProxy() returned error: %v", err)
	}
	defer p.Close()

	peer := &Peer{
		DeviceID: "device-b",
		PublicAddr: &net.UDPAddr{
			IP:   net.ParseIP("127.0.0.1"),
			Port: 9999,
		},
	}

	p.UpdatePeer(peer)

	if p.peer != peer {
		t.Fatal("UpdatePeer() did not update peer")
	}
	if p.peer.DeviceID != "device-b" {
		t.Fatalf("unexpected DeviceID: %s", p.peer.DeviceID)
	}
}

func TestStartTraversalErrors(t *testing.T) {
	p, err := NewProxy("127.0.0.1:0", "127.0.0.1:0", "127.0.0.1:51820", nil)
	if err != nil {
		t.Fatalf("NewProxy() returned error: %v", err)
	}
	defer p.Close()

	if err := p.StartTraversal(); err == nil {
		t.Fatal("expected error when peer is nil")
	}

	p.UpdatePeer(&Peer{DeviceID: "peer-without-address"})

	if err := p.StartTraversal(); err == nil {
		t.Fatal("expected error when peer public address is nil")
	}
}
