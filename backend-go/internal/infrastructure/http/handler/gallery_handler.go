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

type GalleryHandler struct {
	galleryRepo repository.GalleryRepository
}

func NewGalleryHandler(galleryRepo repository.GalleryRepository) *GalleryHandler {
	return &GalleryHandler{galleryRepo: galleryRepo}
}

func (h *GalleryHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	galleries, err := h.galleryRepo.FindAll(r.Context())
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch gallery"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(galleries)
}

func (h *GalleryHandler) Create(w http.ResponseWriter, r *http.Request) {
	claims, _ := r.Context().Value("user").(*service.Claims)

	// Parse multipart form
	err := r.ParseMultipartForm(50 << 20) // 50MB max
	if err != nil {
		http.Error(w, `{"error": "Failed to parse form"}`, http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, `{"error": "No file uploaded"}`, http.StatusBadRequest)
		return
	}
	defer file.Close()

	// In production, save file to storage
	filePath := "/uploads/" + handler.Filename
	caption := r.FormValue("caption")

	// Determine file type
	fileType := entity.FileTypePhoto
	if handler.Header.Get("Content-Type")[:5] == "video" {
		fileType = entity.FileTypeVideo
	}

	gallery := &entity.Gallery{
		UserID:   claims.UserID,
		FileType: fileType,
		FilePath: filePath,
		Caption:  caption,
	}

	if err := h.galleryRepo.Create(r.Context(), gallery); err != nil {
		http.Error(w, `{"error": "Failed to create gallery item"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Upload successful",
		"item":    gallery,
	})
}

func (h *GalleryHandler) Delete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.ParseInt(vars["id"], 10, 64)
	claims, _ := r.Context().Value("user").(*service.Claims)

	// Check ownership or admin
	gallery, err := h.galleryRepo.FindByID(r.Context(), id)
	if err != nil {
		http.Error(w, `{"error": "Item not found"}`, http.StatusNotFound)
		return
	}

	if gallery.UserID != claims.UserID && claims.Role != "super_admin" {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusForbidden)
		return
	}

	if err := h.galleryRepo.Delete(r.Context(), id); err != nil {
		http.Error(w, `{"error": "Failed to delete item"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Item deleted successfully"})
}
