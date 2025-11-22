package handler

import (
	"encoding/json"
	"net/http"

	"github.com/irfan-ghzl/fasisi-backend/internal/domain/entity"
	"github.com/irfan-ghzl/fasisi-backend/internal/domain/repository"
	"github.com/irfan-ghzl/fasisi-backend/internal/domain/service"
)

type ChatHandler struct {
	chatRepo repository.ChatRepository
}

func NewChatHandler(chatRepo repository.ChatRepository) *ChatHandler {
	return &ChatHandler{
		chatRepo: chatRepo,
	}
}

// GetHistory retrieves chat messages between the current user and their partner
func (h *ChatHandler) GetHistory(w http.ResponseWriter, r *http.Request) {
	claims, _ := r.Context().Value("user").(*service.Claims)

	// Determine partner ID (user 1 chats with user 2)
	partnerID := int64(1)
	if claims.UserID == 1 {
		partnerID = 2
	}

	messages, err := h.chatRepo.FindHistory(r.Context(), claims.UserID, partnerID)
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch messages"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

type SendMessageReq struct {
	Message string `json:"message"`
}

// SendMessage sends a new chat message
func (h *ChatHandler) SendMessage(w http.ResponseWriter, r *http.Request) {
	claims, _ := r.Context().Value("user").(*service.Claims)

	var req SendMessageReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request"}`, http.StatusBadRequest)
		return
	}

	if req.Message == "" {
		http.Error(w, `{"error": "Message cannot be empty"}`, http.StatusBadRequest)
		return
	}

	// Determine receiver ID
	receiverID := int64(1)
	if claims.UserID == 1 {
		receiverID = 2
	}

	chatMessage := &entity.ChatMessage{
		SenderID:   claims.UserID,
		ReceiverID: receiverID,
		Message:    req.Message,
		ReadStatus: false,
	}

	if err := h.chatRepo.Create(r.Context(), chatMessage); err != nil {
		http.Error(w, `{"error": "Failed to send message"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Message sent successfully",
		"data":    chatMessage,
	})
}

// MarkAsRead marks messages from sender as read
func (h *ChatHandler) MarkAsRead(w http.ResponseWriter, r *http.Request) {
	claims, _ := r.Context().Value("user").(*service.Claims)

	// Determine partner ID
	partnerID := int64(1)
	if claims.UserID == 1 {
		partnerID = 2
	}

	if err := h.chatRepo.MarkAsRead(r.Context(), partnerID, claims.UserID); err != nil {
		http.Error(w, `{"error": "Failed to mark messages as read"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Messages marked as read"})
}

// GetUnreadCount gets unread message count for current user
func (h *ChatHandler) GetUnreadCount(w http.ResponseWriter, r *http.Request) {
	claims, _ := r.Context().Value("user").(*service.Claims)

	count, err := h.chatRepo.CountUnread(r.Context(), claims.UserID)
	if err != nil {
		http.Error(w, `{"error": "Failed to get unread count"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int64{"count": count})
}
