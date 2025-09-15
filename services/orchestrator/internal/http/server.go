package httpserver

import (
	"fmt"
	"net/http"
	"time"

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

	send := func(event, data string) {
		_, _ = fmt.Fprintf(w, "event: %s\n", event)
		_, _ = fmt.Fprintf(w, "data: %s\n\n", data)
		flusher.Flush()
	}

	send("token", `{"delta":"Hello"}`)
	time.Sleep(150 * time.Millisecond)
	send("token", `{"delta":", world!"}`)
	time.Sleep(100 * time.Millisecond)
	send("completed", `{"usage":{"prompt":10,"completion":2}}`)
}
