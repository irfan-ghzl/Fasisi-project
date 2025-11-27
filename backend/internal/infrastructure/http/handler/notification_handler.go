package handler

import (
	"encoding/json"
	"net/http"

	"github.com/irfan-ghzl/fasisi-backend/internal/domain/repository"
	"github.com/irfan-ghzl/fasisi-backend/internal/domain/service"
	"github.com/irfan-ghzl/fasisi-backend/internal/infrastructure/http/middleware"
)

type NotificationHandler struct {
	notifRepo repository.NotificationRepository
}

func NewNotificationHandler(notifRepo repository.NotificationRepository) *NotificationHandler {
	return &NotificationHandler{notifRepo: notifRepo}
}

// GetAll returns all notifications for the current user
func (h *NotificationHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*service.Claims)
	if !ok || claims == nil {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	notifications, err := h.notifRepo.FindByUserID(r.Context(), claims.UserID, 50) // Get last 50 notifications
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch notifications"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notifications)
}

// GetUnreadCount returns count of unread notifications
func (h *NotificationHandler) GetUnreadCount(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*service.Claims)
	if !ok || claims == nil {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	count, err := h.notifRepo.CountUnread(r.Context(), claims.UserID)
	if err != nil {
		http.Error(w, `{"error": "Failed to get count"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"count": count,
	})
}

// MarkAsRead marks a notification as read
func (h *NotificationHandler) MarkAsRead(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*service.Claims)
	if !ok || claims == nil {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	if err := h.notifRepo.MarkAllAsRead(r.Context(), claims.UserID); err != nil {
		http.Error(w, `{"error": "Failed to mark as read"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "All notifications marked as read",
	})
}
