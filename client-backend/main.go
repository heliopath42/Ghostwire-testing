package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"time"

	"github.com/devlup-labs/Ghostwire/client-backend/nat"
)

type CheckinRequest struct {
	DeviceID  string `json:"deviceId"`
	GwIP      string `json:"gwIp"`
	GwPort    int    `json:"gwPort"`
	PublicIP  string `json:"publicIp"`
	IsHealthy bool   `json:"isHealthy"`
}

type ACLEntry struct {
	UserID        string `json:"UserID"`
	Name          string `json:"Name"`
	GwIp          string `json:"GwIp"`
	PublicKey     []byte `json:"PublicKey"`
	PublicAddress string `json:"PublicAddress"`
}

type CheckinResponse struct {
	Allowlist map[string]ACLEntry `json:"allowlist"`
	Blocklist map[string]ACLEntry `json:"blocklist"`
}

func main() {
	proxy, err := nat.NewProxy(
		"127.0.0.1:0",
		":0",
		"127.0.0.1:51820",
		nil,
	)
	if err != nil {
		log.Fatal(err)
	}
	defer proxy.Close()

	// Step 1: Ask STUN for our public IP and port.
	publicAddr, err := proxy.DiscoverPublicAddr(
		"stun.l.google.com:19302",
	)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Public address:", publicAddr)

	time.Sleep(time.Second)

	proxy.Start()

	// Step 2: Send that address to the coordination server.
	checkinData := CheckinRequest{
		DeviceID:  "d3914fa4-854b-4339-bccd-323a45757281",
		GwIP:      "10.0.0.6",
		GwPort:    51820,
		PublicIP:  publicAddr.String(),
		IsHealthy: true,
	}

	body, err := json.Marshal(checkinData)
	if err != nil {
		log.Fatal(err)
	}

	response, err := http.Post(
		"http://127.0.0.1:8000/api/v1/checkin",
		"application/json",
		bytes.NewBuffer(body),
	)
	if err != nil {
		log.Fatal(err)
	}
	defer response.Body.Close()

	responseBody, err := io.ReadAll(response.Body)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Checkin status:", response.Status)
	var checkinResponse CheckinResponse

	if err := json.Unmarshal(responseBody, &checkinResponse); err != nil {
		log.Fatal(err)
	}
	for deviceID, peerInfo := range checkinResponse.Allowlist {

		fmt.Println("Peer found:", deviceID)
		fmt.Println("Peer address:", peerInfo.PublicAddress)
		fmt.Println("Peer virtual IP:", peerInfo.GwIp)

		peerAddr, err := net.ResolveUDPAddr(
			"udp",
			peerInfo.PublicAddress,
		)

		if err != nil {
			log.Fatal(err)
		}

		peer := &nat.Peer{
			DeviceID:   deviceID,
			PublicAddr: peerAddr,
		}

		proxy.UpdatePeer(peer)

		err = proxy.StartTraversal()
		if err != nil {
			log.Fatal(err)
		}
	}

	select {}
}
