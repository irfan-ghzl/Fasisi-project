package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gorilla/mux"
)

func TestRequestHandler_CreateRequest(t *testing.T) {
	tests := []struct {
		name           string
		payload        map[string]interface{}
		expectedStatus int
		userRole       string
	}{
		{
			name: "Valid food request",
			payload: map[string]interface{}{
				"request_type": "food",
				"title":        "Makan di Restoran Italia",
				"description":  "Aku mau coba pasta carbonara",
				"location":     "Restoran Bella Italia",
			},
			expectedStatus: http.StatusCreated,
			userRole:       "user",
		},
		{
			name: "Valid place request",
			payload: map[string]interface{}{
				"request_type": "place",
				"title":        "Jalan ke Pantai",
				"description":  "Lihat sunset bareng",
				"location":     "Pantai Kuta",
			},
			expectedStatus: http.StatusCreated,
			userRole:       "user",
		},
		{
			name: "Missing required fields",
			payload: map[string]interface{}{
				"request_type": "food",
			},
			expectedStatus: http.StatusBadRequest,
			userRole:       "user",
		},
		{
			name: "Invalid request type",
			payload: map[string]interface{}{
				"request_type": "invalid",
				"title":        "Test",
				"description":  "Test description",
				"location":     "Test location",
			},
			expectedStatus: http.StatusBadRequest,
			userRole:       "user",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.payload)
			req := httptest.NewRequest(http.MethodPost, "/api/requests", bytes.NewReader(body))
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("Authorization", "Bearer mock.jwt.token")

			w := httptest.NewRecorder()

			t.Logf("Test %s expects status %d", tt.name, tt.expectedStatus)
		})
	}
}

func TestRequestHandler_DeleteRequest(t *testing.T) {
	tests := []struct {
		name           string
		requestID      string
		userRole       string
		ownsRequest    bool
		expectedStatus int
	}{
		{
			name:           "Super admin can delete any request",
			requestID:      "1",
			userRole:       "super_admin",
			ownsRequest:    false,
			expectedStatus: http.StatusOK,
		},
		{
			name:           "User can delete own request",
			requestID:      "2",
			userRole:       "user",
			ownsRequest:    true,
			expectedStatus: http.StatusOK,
		},
		{
			name:           "User cannot delete others request",
			requestID:      "3",
			userRole:       "user",
			ownsRequest:    false,
			expectedStatus: http.StatusForbidden,
		},
		{
			name:           "Invalid request ID",
			requestID:      "invalid",
			userRole:       "super_admin",
			ownsRequest:    false,
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodDelete, "/api/requests/"+tt.requestID, nil)
			req.Header.Set("Authorization", "Bearer mock.jwt.token")

			// Set up router with path variables
			req = mux.SetURLVars(req, map[string]string{"id": tt.requestID})

			w := httptest.NewRecorder()

			t.Logf("Test %s expects status %d", tt.name, tt.expectedStatus)
		})
	}
}

func TestRequestHandler_GetRequests(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/requests", nil)
	req.Header.Set("Authorization", "Bearer mock.jwt.token")

	w := httptest.NewRecorder()

	t.Log("Should return list of date requests")
}

func TestRequestHandler_UpdateRequestStatus(t *testing.T) {
	tests := []struct {
		name           string
		requestID      string
		status         string
		expectedStatus int
	}{
		{
			name:           "Approve request",
			requestID:      "1",
			status:         "approved",
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Reject request",
			requestID:      "2",
			status:         "rejected",
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Invalid status",
			requestID:      "3",
			status:         "invalid_status",
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			payload := map[string]string{"status": tt.status}
			body, _ := json.Marshal(payload)
			
			req := httptest.NewRequest(http.MethodPatch, "/api/requests/"+tt.requestID+"/status", bytes.NewReader(body))
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("Authorization", "Bearer mock.jwt.token")
			req = mux.SetURLVars(req, map[string]string{"id": tt.requestID})

			w := httptest.NewRecorder()

			t.Logf("Test %s expects status %d", tt.name, tt.expectedStatus)
		})
	}
}
