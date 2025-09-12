package middleware

import (
	"auth-service/internal/config"
	"auth-service/internal/models"
	"auth-service/pkg/logger"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/Nerzal/gocloak/v13"
	"github.com/gin-gonic/gin"
)

// Simple in-memory rate limiter for MVP
type rateLimiter struct {
	requests map[string][]time.Time
	mutex    sync.RWMutex
	limit    int
	window   time.Duration
}

func newRateLimiter(limit int, window time.Duration) *rateLimiter {
	return &rateLimiter{
		requests: make(map[string][]time.Time),
		limit:    limit,
		window:   window,
	}
}

func (rl *rateLimiter) allow(ip string) bool {
	rl.mutex.Lock()
	defer rl.mutex.Unlock()

	now := time.Now()
	windowStart := now.Add(-rl.window)

	// Clean old requests
	if requests, exists := rl.requests[ip]; exists {
		var validRequests []time.Time
		for _, reqTime := range requests {
			if reqTime.After(windowStart) {
				validRequests = append(validRequests, reqTime)
			}
		}
		rl.requests[ip] = validRequests
	}

	// Check if limit exceeded
	if len(rl.requests[ip]) >= rl.limit {
		return false
	}

	// Add current request
	rl.requests[ip] = append(rl.requests[ip], now)
	return true
}

var authRateLimiter = newRateLimiter(50, time.Minute)    // 50 auth attempts per minute for testing
var generalRateLimiter = newRateLimiter(100, time.Minute) // 100 general requests per minute

// AuthMiddleware validates JWT tokens from Keycloak
func AuthMiddleware(cfg *config.Config, logger *logger.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Rate limiting for protected routes
		if !generalRateLimiter.allow(c.ClientIP()) {
			c.JSON(http.StatusTooManyRequests, models.ErrorResponse{
				Error:   "rate_limit_exceeded",
				Message: "Too many requests. Please try again later.",
				Code:    http.StatusTooManyRequests,
			})
			c.Abort()
			return
		}

		// Get token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "unauthorized",
				Message: "Authorization header is required",
				Code:    http.StatusUnauthorized,
			})
			c.Abort()
			return
		}

		// Check if token starts with "Bearer "
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "unauthorized",
				Message: "Invalid authorization header format",
				Code:    http.StatusUnauthorized,
			})
			c.Abort()
			return
		}

		token := tokenParts[1]

		// Validate token with Keycloak
		client := gocloak.NewClient(cfg.Keycloak.URL)
		result, err := client.RetrospectToken(c.Request.Context(), token, cfg.Keycloak.ClientID, cfg.Keycloak.ClientSecret, cfg.Keycloak.Realm)
		if err != nil {
			logger.WithError(err).Error("Failed to validate token")
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "unauthorized",
				Message: "Invalid token",
				Code:    http.StatusUnauthorized,
			})
			c.Abort()
			return
		}

		// Check if token is active
		if !*result.Active {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "unauthorized",
				Message: "Token is not active",
				Code:    http.StatusUnauthorized,
			})
			c.Abort()
			return
		}

		// Get user info and add to context
		userInfo, err := client.GetUserInfo(c.Request.Context(), token, cfg.Keycloak.Realm)
		if err != nil {
			logger.WithError(err).Error("Failed to get user info")
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "unauthorized",
				Message: "Failed to get user info",
				Code:    http.StatusUnauthorized,
			})
			c.Abort()
			return
		}

		// Add user info to context
		c.Set("user_id", *userInfo.Sub)
		c.Set("username", *userInfo.PreferredUsername)
		c.Set("email", *userInfo.Email)
		c.Set("access_token", token)

		c.Next()
	}
}

// AuthRateLimitMiddleware for auth endpoints (login, register)
func AuthRateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !authRateLimiter.allow(c.ClientIP()) {
			c.JSON(http.StatusTooManyRequests, models.ErrorResponse{
				Error:   "auth_rate_limit_exceeded",
				Message: "Too many authentication attempts. Please try again in a minute.",
				Code:    http.StatusTooManyRequests,
			})
			c.Abort()
			return
		}
		c.Next()
	}
}

// LoggerMiddleware logs HTTP requests
func LoggerMiddleware(logger *logger.Logger) gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		logger.WithFields(map[string]interface{}{
			"status":     param.StatusCode,
			"method":     param.Method,
			"path":       param.Path,
			"ip":         param.ClientIP,
			"user_agent": param.Request.UserAgent(),
			"latency":    param.Latency,
		}).Info("HTTP Request")
		return ""
	})
}

// CORSMiddleware handles CORS - FIXED for MVP security
func CORSMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get allowed origins from config, default to localhost for MVP
		allowedOrigins := []string{
			"http://localhost:3000",
			"http://localhost:3080",
			"http://localhost:3090",
			"http://localhost:8080",
			"https://yourdomain.com", // Add your actual domain here
		}

		origin := c.Request.Header.Get("Origin")
		allowed := false
		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				allowed = true
				break
			}
		}

		if allowed {
			c.Header("Access-Control-Allow-Origin", origin)
		}
		
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// InputValidationMiddleware for basic security
func InputValidationMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Basic XSS protection
		if strings.Contains(c.Request.URL.Path, "<script>") ||
			strings.Contains(c.Request.URL.Path, "javascript:") {
			c.JSON(http.StatusBadRequest, models.ErrorResponse{
				Error:   "invalid_input",
				Message: "Invalid characters in request",
				Code:    http.StatusBadRequest,
			})
			c.Abort()
			return
		}
		c.Next()
	}
}
