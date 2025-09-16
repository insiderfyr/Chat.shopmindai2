package config

import "os"

type Config struct {
	Port           string
	Env            string
	AllowedOrigins string
	LLMProxyURL    string // ex: http://localhost:9000
	LLMProxyToken  string // optional: Authorization Bearer
}

func Load() Config {
	return Config{
		Port:           getenv("APP_PORT", "8090"),
		Env:            getenv("APP_ENV", "dev"),
		AllowedOrigins: getenv("ALLOWED_ORIGINS", "*"),
		LLMProxyURL:    getenv("LLM_PROXY_URL", ""),
		LLMProxyToken:  getenv("LLM_PROXY_TOKEN", ""),
	}
}

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
