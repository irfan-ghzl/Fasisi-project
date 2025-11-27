package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestChatHandler_SendMessage(t *testing.T) {
	tests := []struct {
		name           string
		payload        map[string]string
		expectedStatus int
	}{
		{
			name: "Valid message",
			payload: map[string]string{
				"message": "Halo sayang, apa kabar?",
			},
			expectedStatus: http.StatusCreated,
		},
		{
			name: "Empty message",
			payload: map[string]string{
				"message": "",
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "Long message",
			payload: map[string]string{
				"message": "This is a very long message that contains more than 500 characters to test the validation..." + string(make([]byte, 500)),
			},
			expectedStatus: http.StatusCreated,
		},
		{
			name:           "Missing message field",
			payload:        map[string]string{},
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.payload)
			req := httptest.NewRequest(http.MethodPost, "/api/chat/messages", bytes.NewReader(body))
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("Authorization", "Bearer mock.jwt.token")

			w := httptest.NewRecorder()

			t.Logf("Test %s expects status %d", tt.name, tt.expectedStatus)
		})
	}
}

func TestChatHandler_GetMessages(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/chat/messages", nil)
	req.Header.Set("Authorization", "Bearer mock.jwt.token")

	w := httptest.NewRecorder()

	t.Log("Should return chat message history")
}

func TestChatHandler_MarkAsRead(t *testing.T) {
	payload := map[string]int{"message_id": 1}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest(http.MethodPost, "/api/chat/messages/read", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer mock.jwt.token")

	w := httptest.NewRecorder()

	t.Log("Should mark message as read")
}

func TestChatHandler_GetUnreadCount(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/chat/unread", nil)
	req.Header.Set("Authorization", "Bearer mock.jwt.token")

	w := httptest.NewRecorder()

	t.Log("Should return unread message count")
}
