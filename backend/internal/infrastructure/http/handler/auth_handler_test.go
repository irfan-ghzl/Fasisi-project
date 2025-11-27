package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gorilla/mux"
)

func TestAuthHandler_Login(t *testing.T) {
	tests := []struct {
		name           string
		payload        map[string]string
		expectedStatus int
		expectToken    bool
	}{
		{
			name: "Valid login - Irfan",
			payload: map[string]string{
				"email":    "irfan@fasisi.com",
				"password": "irfan123",
			},
			expectedStatus: http.StatusOK,
			expectToken:    true,
		},
		{
			name: "Valid login - Sisti",
			payload: map[string]string{
				"email":    "sisti@fasisi.com",
				"password": "sisti123",
			},
			expectedStatus: http.StatusOK,
			expectToken:    true,
		},
		{
			name: "Invalid credentials",
			payload: map[string]string{
				"email":    "irfan@fasisi.com",
				"password": "wrongpassword",
			},
			expectedStatus: http.StatusUnauthorized,
			expectToken:    false,
		},
		{
			name: "Missing email",
			payload: map[string]string{
				"password": "irfan123",
			},
			expectedStatus: http.StatusBadRequest,
			expectToken:    false,
		},
		{
			name: "Missing password",
			payload: map[string]string{
				"email": "irfan@fasisi.com",
			},
			expectedStatus: http.StatusBadRequest,
			expectToken:    false,
		},
		{
			name: "Invalid email format",
			payload: map[string]string{
				"email":    "notanemail",
				"password": "password",
			},
			expectedStatus: http.StatusBadRequest,
			expectToken:    false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create request body
			body, _ := json.Marshal(tt.payload)
			req := httptest.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewReader(body))
			req.Header.Set("Content-Type", "application/json")

			// Record response
			w := httptest.NewRecorder()

			// Note: This is a placeholder test structure
			// In actual implementation, you would initialize the handler with mock repositories
			// and call handler.Login(w, req)

			t.Logf("Test %s expects status %d", tt.name, tt.expectedStatus)
		})
	}
}

func TestAuthHandler_GetProfile(t *testing.T) {
	tests := []struct {
		name           string
		authHeader     string
		expectedStatus int
	}{
		{
			name:           "Valid JWT token",
			authHeader:     "Bearer valid.jwt.token",
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Missing authorization header",
			authHeader:     "",
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "Invalid token format",
			authHeader:     "Invalid token",
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "Expired token",
			authHeader:     "Bearer expired.jwt.token",
			expectedStatus: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/api/auth/profile", nil)
			if tt.authHeader != "" {
				req.Header.Set("Authorization", tt.authHeader)
			}

			w := httptest.NewRecorder()

			t.Logf("Test %s expects status %d", tt.name, tt.expectedStatus)
		})
	}
}
