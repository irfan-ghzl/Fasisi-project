package handler

import (
	"encoding/json"
	"net/http"

	"github.com/irfan-ghzl/fasisi-backend/internal/domain/repository"
	"github.com/irfan-ghzl/fasisi-backend/internal/domain/service"
	"github.com/irfan-ghzl/fasisi-backend/internal/infrastructure/http/middleware"
)

type AuthHandler struct {
	userRepo    repository.UserRepository
	authService *service.AuthService
}

func NewAuthHandler(userRepo repository.UserRepository, authService *service.AuthService) *AuthHandler {
	return &AuthHandler{
		userRepo:    userRepo,
		authService: authService,
	}
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Message      string      `json:"message"`
	Token        string      `json:"token"`
	RefreshToken string      `json:"refresh_token"`
	ExpiresIn    int         `json:"expires_in"` // seconds
	User         interface{} `json:"user"`
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request"}`, http.StatusBadRequest)
		return
	}

	user, err := h.userRepo.FindByEmail(r.Context(), req.Email)
	if err != nil {
		http.Error(w, `{"error": "Invalid credentials"}`, http.StatusUnauthorized)
		return
	}

	if !h.authService.CheckPassword(req.Password, user.PasswordHash) {
		http.Error(w, `{"error": "Invalid credentials"}`, http.StatusUnauthorized)
		return
	}

	// Generate access token (15 minutes)
	token, err := h.authService.GenerateToken(user.ID, user.Username, string(user.Role))
	if err != nil {
		http.Error(w, `{"error": "Failed to generate token"}`, http.StatusInternalServerError)
		return
	}

	// Generate refresh token (7 days)
	refreshToken, err := h.authService.GenerateRefreshToken(user.ID, user.Username, string(user.Role))
	if err != nil {
		http.Error(w, `{"error": "Failed to generate refresh token"}`, http.StatusInternalServerError)
		return
	}

	response := LoginResponse{
		Message:      "Login successful",
		Token:        token,
		RefreshToken: refreshToken,
		ExpiresIn:    900, // 15 minutes in seconds
		User: map[string]interface{}{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"phone":    user.Phone,
			"role":     user.Role,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *AuthHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*service.Claims)
	if !ok {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	user, err := h.userRepo.FindByID(r.Context(), claims.UserID)
	if err != nil {
		http.Error(w, `{"error": "User not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":         user.ID,
		"username":   user.Username,
		"email":      user.Email,
		"phone":      user.Phone,
		"role":       user.Role,
		"created_at": user.CreatedAt,
	})
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

// RefreshToken refreshes an access token using refresh token
func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	var req RefreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request"}`, http.StatusBadRequest)
		return
	}

	// Validate refresh token
	claims, err := h.authService.ValidateToken(req.RefreshToken)
	if err != nil {
		http.Error(w, `{"error": "Invalid or expired refresh token"}`, http.StatusUnauthorized)
		return
	}

	// Generate new access token
	newToken, err := h.authService.GenerateToken(claims.UserID, claims.Username, claims.Role)
	if err != nil {
		http.Error(w, `{"error": "Failed to generate new token"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token":      newToken,
		"expires_in": 900, // 15 minutes
	})
}
