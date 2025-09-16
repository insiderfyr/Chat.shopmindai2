package llm

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/rs/zerolog/log"

	"github.com/shopmindai/llm-proxy/internal/config"
)

type Client struct {
	cfg    config.Config
	client *http.Client
}

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Model       string        `json:"model"`
	Messages    []ChatMessage `json:"messages"`
	MaxTokens   int           `json:"max_tokens,omitempty"`
	Temperature float64       `json:"temperature,omitempty"`
	Stream      bool          `json:"stream"`
}

type ChatResponse struct {
	Choices []struct {
		Delta struct {
			Content string `json:"content"`
		} `json:"delta"`
		FinishReason string `json:"finish_reason"`
	} `json:"choices"`
}

func New(cfg config.Config) *Client {
	return &Client{
		cfg: cfg,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *Client) StreamChat(messages []ChatMessage, writer io.Writer) error {
	req := ChatRequest{
		Model:       c.cfg.LLMModel,
		Messages:    messages,
		Stream:      true,
		Temperature: 0.7,
	}

	reqBody, err := json.Marshal(req)
	if err != nil {
		return fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("POST", c.cfg.LLMBaseURL+"/chat/completions", bytes.NewBuffer(reqBody))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+c.cfg.LLMAPIKey)

	resp, err := c.client.Do(httpReq)
	if err != nil {
		return fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("API request failed: %d %s", resp.StatusCode, string(body))
	}

	// Stream SSE response
	decoder := json.NewDecoder(resp.Body)
	for {
		var chunk ChatResponse
		if err := decoder.Decode(&chunk); err != nil {
			if err == io.EOF {
				break
			}
			log.Error().Err(err).Msg("failed to decode chunk")
			continue
		}

		if len(chunk.Choices) > 0 {
			content := chunk.Choices[0].Delta.Content
			if content != "" {
				fmt.Fprintf(writer, "data: %s\n\n", content)
			}
			
			if chunk.Choices[0].FinishReason == "stop" {
				fmt.Fprintf(writer, "data: [DONE]\n\n")
				break
			}
		}
	}

	return nil
}
