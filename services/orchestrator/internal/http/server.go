package httpserver

import (
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/rs/zerolog/log"

	"github.com/shopmindai/orchestrator/internal/config"
)

type Server struct {
	Router *chi.Mux
	cfg    config.Config
}

func New(cfg config.Config) *Server {
	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{cfg.AllowedOrigins},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Requested-With"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	s := &Server{Router: r, cfg: cfg}
	s.routes()
	return s
}

func (s *Server) routes() {
	s.Router.Get("/orchestrator/v1/healthz", s.handleHealthz)
	s.Router.Post("/orchestrator/v1/sessions/{sessionId}/messages/stream", s.handleChatStream)
}

func (s *Server) handleHealthz(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"status":"ok"}`))
}

func (s *Server) handleChatStream(w http.ResponseWriter, r *http.Request) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming unsupported", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	sessionID := chi.URLParam(r, "sessionId")
	log.Info().Str("sessionId", sessionID).Msg("starting SSE stream")

	if s.cfg.LLMProxyURL == "" {
		http.Error(w, "LLM proxy not configured", http.StatusServiceUnavailable)
		return
	}

	// Forward body to llm-proxy (expects POST streaming SSE)
	req, err := http.NewRequestWithContext(r.Context(), "POST", s.cfg.LLMProxyURL+"/v1/chat/stream", r.Body)
	if err != nil {
		http.Error(w, "failed to build upstream request", http.StatusInternalServerError)
		return
	}
	req.Header.Set("Content-Type", r.Header.Get("Content-Type"))
	req.Header.Set("Accept", "text/event-stream")
	if s.cfg.LLMProxyToken != "" {
		req.Header.Set("Authorization", "Bearer "+s.cfg.LLMProxyToken)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		http.Error(w, "upstream unavailable", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		http.Error(w, fmt.Sprintf("upstream error: %s", resp.Status), http.StatusBadGateway)
		return
	}

	// Pipe SSE 1:1
	buf := make([]byte, 16*1024)
	for {
		n, readErr := resp.Body.Read(buf)
		if n > 0 {
			if _, writeErr := w.Write(buf[:n]); writeErr != nil {
				return
			}
			flusher.Flush()
		}
		if readErr != nil {
			break
		}
	}
}
