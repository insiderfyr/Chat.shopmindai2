package httpserver

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/rs/zerolog/log"

	"github.com/shopmindai/orchestrator/internal/auth"
	"github.com/shopmindai/orchestrator/internal/config"
)

type Server struct {
	Router        *chi.Mux
	cfg           config.Config
	authValidator *auth.Validator
}

type claimsContextKey struct{}

func New(cfg config.Config) (*Server, error) {
	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{cfg.AllowedOrigins},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Requested-With"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	validator, err := auth.NewValidator(context.Background(), cfg.AuthService)
	if err != nil {
		return nil, err
	}

	s := &Server{Router: r, cfg: cfg, authValidator: validator}
	s.routes()
	return s, nil
}

func (s *Server) Close() {
	if s.authValidator != nil {
		s.authValidator.Close()
	}
}

func (s *Server) routes() {
	s.Router.Get("/orchestrator/v1/healthz", s.handleHealthz)

	s.Router.Group(func(r chi.Router) {
		if s.authValidator != nil {
			r.Use(s.requireAuth)
		}
		r.Post("/orchestrator/v1/sessions/{sessionId}/messages/stream", s.handleChatStream)
	})
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
	logEvt := log.Info().Str("sessionId", sessionID).Str("llmProxyURL", s.cfg.LLMProxyURL)
	if claims, ok := r.Context().Value(claimsContextKey{}).(*auth.Claims); ok && claims != nil {
		logEvt = logEvt.Str("subject", claims.Subject).Str("username", claims.Username)
	}
	logEvt.Msg("starting SSE stream")

	if s.cfg.LLMProxyURL == "" {
		log.Warn().Msg("LLM proxy not configured")
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

func (s *Server) requireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		parts := strings.Fields(authHeader)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		claims, err := s.authValidator.Verify(parts[1])
		if err != nil {
			log.Warn().Err(err).Msg("token verification failed")
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), claimsContextKey{}, claims)))
	})
}
