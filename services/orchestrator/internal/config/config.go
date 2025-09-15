package config

import "os"

type Config struct {
	Port           string
	Env            string
	AllowedOrigins string
}

func Load() Config {
	return Config{
		Port:           getenv("APP_PORT", "8080"),
		Env:            getenv("APP_ENV", "dev"),
		AllowedOrigins: getenv("ALLOWED_ORIGINS", "*"),
	}
}

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
