package nat

import "net"

// Peer represents a device we want to establish a direct
// UDP connection with.
type Peer struct {
	DeviceID string

	// PublicAddr is the address received from the coordination server.
	//
	// Example:
	// 49.36.100.20:51820
	PublicAddr *net.UDPAddr
}
