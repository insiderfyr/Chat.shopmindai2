package models

import (
	"time"
	"unicode"
	"strings"
)

// User represents a user in the system
type User struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Enabled   bool      `json:"enabled"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// LoginRequest represents a login request
type LoginRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Password string `json:"password" binding:"required,min=8"`
}

// RegisterRequest represents a registration request - IMPROVED VALIDATION
type RegisterRequest struct {
	Username  string `json:"username" binding:"required,min=3,max=30"`
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=8,max=128"`
	FirstName string `json:"first_name" binding:"required,min=2,max=50"`
	LastName  string `json:"last_name" binding:"required,min=2,max=50"`
}

// Validate performs additional validation for RegisterRequest
func (r *RegisterRequest) Validate() []string {
	var errors []string

	// Username validation
	if !isValidUsername(r.Username) {
		errors = append(errors, "username must contain only letters, numbers, and underscores")
	}

	// Password validation
	if !isValidPassword(r.Password) {
		errors = append(errors, "password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
	}

	// Name validation (no numbers or special chars)
	if !isValidName(r.FirstName) {
		errors = append(errors, "first name must contain only letters and spaces")
	}
	if !isValidName(r.LastName) {
		errors = append(errors, "last name must contain only letters and spaces")
	}

	return errors
}

// RefreshRequest represents a token refresh request
type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// AuthResponse represents an authentication response
type AuthResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	User         *User  `json:"user"`
}

// ChangePasswordRequest represents a password change request - IMPROVED
type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=8,max=128"`
}

// Validate performs additional validation for ChangePasswordRequest
func (c *ChangePasswordRequest) Validate() []string {
	var errors []string
	
	if c.CurrentPassword == c.NewPassword {
		errors = append(errors, "new password must be different from current password")
	}
	
	if !isValidPassword(c.NewPassword) {
		errors = append(errors, "password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
	}
	
	return errors
}

// UpdateProfileRequest represents a profile update request - IMPROVED
type UpdateProfileRequest struct {
	FirstName string `json:"first_name" binding:"omitempty,min=2,max=50"`
	LastName  string `json:"last_name" binding:"omitempty,min=2,max=50"`
	Email     string `json:"email" binding:"omitempty,email"`
}

// Validate performs additional validation for UpdateProfileRequest
func (u *UpdateProfileRequest) Validate() []string {
	var errors []string
	
	if u.FirstName != "" && !isValidName(u.FirstName) {
		errors = append(errors, "first name must contain only letters and spaces")
	}
	if u.LastName != "" && !isValidName(u.LastName) {
		errors = append(errors, "last name must contain only letters and spaces")
	}
	
	return errors
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error   string      `json:"error"`
	Message string      `json:"message"`
	Code    int         `json:"code"`
	Details interface{} `json:"details,omitempty"`
}

// SuccessResponse represents a success response
type SuccessResponse struct {
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// Helper validation functions
func isValidUsername(username string) bool {
	for _, char := range username {
		if !unicode.IsLetter(char) && !unicode.IsDigit(char) && char != '_' {
			return false
		}
	}
	return true
}

func isValidPassword(password string) bool {
	var (
		hasUpper   = false
		hasLower   = false
		hasNumber  = false
		hasSpecial = false
	)

	for _, char := range password {
		switch {
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsDigit(char):
			hasNumber = true
		case unicode.IsPunct(char) || unicode.IsSymbol(char):
			hasSpecial = true
		}
	}

	return hasUpper && hasLower && hasNumber && hasSpecial
}

func isValidName(name string) bool {
	name = strings.TrimSpace(name)
	for _, char := range name {
		if !unicode.IsLetter(char) && char != ' ' && char != '\'' && char != '-' {
			return false
		}
	}
	return true
}
