package nat

import (
	"os"
	"testing"
)

// This test needs Internet access, so it is opt-in.
//
// Run:
// RUN_STUN_TEST=1 go test -run TestDiscoverPublicAddr -v
func TestDiscoverPublicAddr(t *testing.T) {
	if os.Getenv("RUN_STUN_TEST") != "1" {
		t.Skip("STUN integration test disabled")
	}

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

	addr, err := p.DiscoverPublicAddr("stun.l.google.com:19302")
	if err != nil {
		t.Fatalf("DiscoverPublicAddr() returned error: %v", err)
	}

	if addr == nil {
		t.Fatal("DiscoverPublicAddr() returned nil")
	}
	if addr.Port == 0 {
		t.Fatalf("invalid public port: %v", addr)
	}

	t.Logf("STUN discovered public address: %s", addr)
}
