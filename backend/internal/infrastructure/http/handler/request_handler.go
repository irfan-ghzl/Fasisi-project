package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/irfan-ghzl/fasisi-backend/internal/domain/entity"
	"github.com/irfan-ghzl/fasisi-backend/internal/domain/repository"
	"github.com/irfan-ghzl/fasisi-backend/internal/domain/service"
)

type RequestHandler struct {
	requestRepo repository.DateRequestRepository
	notifRepo   repository.NotificationRepository
}

func NewRequestHandler(requestRepo repository.DateRequestRepository, notifRepo repository.NotificationRepository) *RequestHandler {
	return &RequestHandler{
		requestRepo: requestRepo,
		notifRepo:   notifRepo,
	}
}

func (h *RequestHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	requests, err := h.requestRepo.FindAll(r.Context())
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch requests"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(requests)
}

type CreateRequestReq struct {
	RequestType string `json:"request_type"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Location    string `json:"location"`
}

func (h *RequestHandler) Create(w http.ResponseWriter, r *http.Request) {
	claims, _ := r.Context().Value("user").(*service.Claims)

	var req CreateRequestReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request"}`, http.StatusBadRequest)
		return
	}

	dateReq := &entity.DateRequest{
		UserID:      claims.UserID,
		RequestType: entity.RequestType(req.RequestType),
		Title:       req.Title,
		Description: req.Description,
		Location:    req.Location,
		Status:      entity.RequestStatusPending,
	}

	if err := h.requestRepo.Create(r.Context(), dateReq); err != nil {
		http.Error(w, `{"error": "Failed to create request"}`, http.StatusInternalServerError)
		return
	}

	// Create notification for partner
	partnerID := int64(1)
	if claims.UserID == 1 {
		partnerID = 2
	}

	notif := &entity.Notification{
		UserID:     partnerID,
		Type:       entity.NotificationTypeDateRequest,
		Message:    claims.Username + " membuat request " + req.Title,
		ReadStatus: false,
	}
	h.notifRepo.Create(r.Context(), notif)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Request created successfully",
		"request": dateReq,
	})
}

func (h *RequestHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.ParseInt(vars["id"], 10, 64)

	var req struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request"}`, http.StatusBadRequest)
		return
	}

	if err := h.requestRepo.UpdateStatus(r.Context(), id, entity.RequestStatus(req.Status)); err != nil {
		http.Error(w, `{"error": "Failed to update status"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Status updated successfully"})
}

func (h *RequestHandler) Delete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.ParseInt(vars["id"], 10, 64)
	claims, _ := r.Context().Value("user").(*service.Claims)

	// Check ownership or admin
	dateReq, err := h.requestRepo.FindByID(r.Context(), id)
	if err != nil {
		http.Error(w, `{"error": "Request not found"}`, http.StatusNotFound)
		return
	}

	if dateReq.UserID != claims.UserID && claims.Role != "super_admin" {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusForbidden)
		return
	}

	if err := h.requestRepo.Delete(r.Context(), id); err != nil {
		http.Error(w, `{"error": "Failed to delete request"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Request deleted successfully"})
}
