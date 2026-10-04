package nat

import (
	"net"
	"testing"
	"time"
)

func TestStartTraversalSendsPunchPacket(t *testing.T) {
	receiver, err := net.ListenUDP("udp", &net.UDPAddr{
		IP:   net.ParseIP("127.0.0.1"),
		Port: 0,
	})
	if err != nil {
		t.Fatalf("failed to create UDP receiver: %v", err)
	}
	defer receiver.Close()

	p, err := NewProxy(
		"127.0.0.1:0",
		"127.0.0.1:0",
		"127.0.0.1:51820",
		&Peer{
			DeviceID:   "device-b",
			PublicAddr: receiver.LocalAddr().(*net.UDPAddr),
		},
	)
	if err != nil {
		t.Fatalf("NewProxy() returned error: %v", err)
	}
	defer p.Close()

	if err := p.StartTraversal(); err != nil {
		t.Fatalf("StartTraversal() returned error: %v", err)
	}

	if err := receiver.SetReadDeadline(time.Now().Add(2 * time.Second)); err != nil {
		t.Fatalf("failed to set read deadline: %v", err)
	}

	buffer := make([]byte, 1024)
	n, _, err := receiver.ReadFromUDP(buffer)
	if err != nil {
		t.Fatalf("did not receive punch packet: %v", err)
	}

	if got := string(buffer[:n]); got != "ghostwire-punch" {
		t.Fatalf("unexpected punch packet: %q", got)
	}
}
