package profitshare

import (
	"crypto/hmac"
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

const (
	defaultBaseURL = "https://api.profitshare.ro"
)

type authTransport struct {
	apiUser    string
	apiKey     string
	underlying http.RoundTripper
}

func (t *authTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	date := time.Now().UTC().Format("Mon, 02 Jan 2006 15:04:05 GMT")

	route := strings.TrimPrefix(req.URL.Path, "/")
	if !strings.HasSuffix(route, "/") {
		route += "/"
	}

	// Based on the JS example, the signature string is built from the raw, unencoded query string.
	queryStringForSignature := req.URL.RawQuery
	
	signatureString := fmt.Sprintf("%s%s?%s/%s%s",
		req.Method,
		route,
		queryStringForSignature,
		t.apiUser,
		date,
	)
	
	h := hmac.New(sha1.New, []byte(t.apiKey))
	h.Write([]byte(signatureString))
	signature := hex.EncodeToString(h.Sum(nil))

	newReq := req.Clone(req.Context())
	newReq.Header.Set("Date", date)
	newReq.Header.Set("X-PS-Client", t.apiUser)
	newReq.Header.Set("X-PS-Accept", "json")
	newReq.Header.Set("X-PS-Auth", signature)
	newReq.Header.Set("Host", "api.profitshare.ro")

	return t.underlying.RoundTrip(newReq)
}

type Client struct {
	httpClient *http.Client
	baseURL    *url.URL
}

func NewClient(apiUser, apiKey string) *Client {
	baseURL, _ := url.Parse(defaultBaseURL)
	return &Client{
		baseURL: baseURL,
		httpClient: &http.Client{
			Transport: &authTransport{
				apiUser:    apiUser,
				apiKey:     apiKey,
				underlying: http.DefaultTransport,
			},
		},
	}
}

func (c *Client) ListProducts(params ListProductsParams) (*ProductResponse, error) {
	endpoint := c.baseURL.ResolveReference(&url.URL{Path: "/affiliate-products/"})

	// Build the query string manually to prevent encoding of '[' and ']' which the server seems to reject.
	queryParams := []string{}
	if params.Page > 0 {
		queryParams = append(queryParams, "page="+strconv.Itoa(params.Page))
	}
	if params.Advertisers != "" {
		queryParams = append(queryParams, "filters[advertiser]="+params.Advertisers)
	}
	if params.PartNo != "" {
		queryParams = append(queryParams, "filters[part_no]="+params.PartNo)
	}
	endpoint.RawQuery = strings.Join(queryParams, "&")

	req, err := http.NewRequest("GET", endpoint.String(), nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API request failed with status %s: %s", resp.Status, string(bodyBytes))
	}

	var productResponse ProductResponse
	if err := json.NewDecoder(resp.Body).Decode(&productResponse); err != nil {
		return nil, fmt.Errorf("failed to decode API response: %w", err)
	}

	return &productResponse, nil
}
