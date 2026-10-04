package coordination

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type ACLEntry struct {
	UserID        string `json:"UserID"`
	Name          string `json:"Name"`
	GwIp          string `json:"GwIp"`
	PublicKey     []byte `json:"PublicKey"`
	PublicAddress string `json:"PublicAddress"`
}

type ACL map[string]ACLEntry

type CheckinRequest struct {
	DeviceID  string `json:"deviceId"`
	GwIp      string `json:"gwIp"`
	GwPort    int    `json:"gwPort"`
	PublicIp  string `json:"publicIp"`
	IsHealthy bool   `json:"isHealthy"`

	AllowlistHashes map[string]string `json:"allowlistHashes"`
	BlocklistHashes map[string]string `json:"blocklistHashes"`
}

type CheckinResponse struct {
	Allowlist ACL `json:"allowlist"`
	Blocklist ACL `json:"blocklist"`
}

func Checkin(
	serverURL string,
	request CheckinRequest,
) (*CheckinResponse, error) {

	body, err := json.Marshal(request)
	if err != nil {
		return nil, fmt.Errorf("failed to encode checkin request: %w", err)
	}

	resp, err := http.Post(
		serverURL+"/api/v1/checkin",
		"application/json",
		bytes.NewBuffer(body),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to send checkin request: %w", err)
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf(
			"checkin failed with status: %s",
			resp.Status,
		)
	}

	var response CheckinResponse

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf(
			"failed to decode checkin response: %w",
			err,
		)
	}

	return &response, nil
}