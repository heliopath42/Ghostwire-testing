package nat

import (
	"fmt"
	"net"

	"github.com/pion/stun"
)

// DiscoverPublicAddr asks a STUN server for the public
// IP address and port associated with publicConn.
func (p *Proxy) DiscoverPublicAddr(stunServer string) (*net.UDPAddr, error) {
	serverAddr, err := net.ResolveUDPAddr("udp", stunServer)
	if err != nil {
		return nil, fmt.Errorf("invalid STUN server address: %w", err)
	}

	// Create a STUN Binding Request.
	message := stun.MustBuild(stun.TransactionID, stun.BindingRequest)

	// Send the request using the SAME public UDP socket.
	if _, err := p.publicConn.WriteToUDP(message.Raw, serverAddr); err != nil {
		return nil, fmt.Errorf("failed to send STUN request: %w", err)
	}

	buffer := make([]byte, 1500)

	// Wait for the STUN response.
	n, _, err := p.publicConn.ReadFromUDP(buffer)
	if err != nil {
		return nil, fmt.Errorf("failed to receive STUN response: %w", err)
	}

	response := new(stun.Message)

	if err := response.UnmarshalBinary(buffer[:n]); err != nil {
		return nil, fmt.Errorf("failed to parse STUN response: %w", err)
	}

	var xorAddr stun.XORMappedAddress

	if err := xorAddr.GetFrom(response); err != nil {
		return nil, fmt.Errorf("failed to get public address: %w", err)
	}

	return &net.UDPAddr{
		IP:   xorAddr.IP,
		Port: xorAddr.Port,
	}, nil
}