package nat

import (
	"fmt"
	"time"
)


// StartTraversal starts UDP hole punching.
func (p *Proxy) StartTraversal() error {

	if p.peer == nil {
		return fmt.Errorf("peer is not set")
	}


	if p.peer.PublicAddr == nil {
		return fmt.Errorf("peer public address is not set")
	}


	go p.sendPunchPackets()

	return nil
}



func (p *Proxy) sendPunchPackets() {


	message := []byte("ghostwire-punch")


	for i := 0; i < 10; i++ {


		fmt.Println(
			"Punch attempt:",
			i+1,
			"to:",
			p.peer.PublicAddr,
		)


		_, err := p.publicConn.WriteToUDP(
			message,
			p.peer.PublicAddr,
		)


		if err != nil {

			fmt.Println(
				"Punch failed:",
				err,
			)

			return
		}


		time.Sleep(500 * time.Millisecond)
	}
}



// UpdatePeer changes peer address.
func (p *Proxy) UpdatePeer(peer *Peer) {

	p.peer = peer

}