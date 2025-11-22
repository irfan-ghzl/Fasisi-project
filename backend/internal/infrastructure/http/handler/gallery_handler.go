package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

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

// Create handles file upload untuk gallery
// Endpoint: POST /api/gallery/upload
// Authentication: Membutuhkan JWT token
// Content-Type: multipart/form-data
//
// Form fields:
// - file: File foto atau video (max 50MB)
// - caption: Caption untuk file
//
// Supported file types:
// - Photos: JPEG, PNG, GIF
// - Videos: MP4, MOV, AVI, WebM
func (h *GalleryHandler) Create(w http.ResponseWriter, r *http.Request) {
	claims, _ := r.Context().Value("user").(*service.Claims)

	// Parse multipart form (50MB max)
	err := r.ParseMultipartForm(50 << 20)
	if err != nil {
		http.Error(w, `{"error": "Failed to parse form"}`, http.StatusBadRequest)
		return
	}

	// Get uploaded file
	file, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, `{"error": "No file uploaded"}`, http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Validate file type
	contentType := handler.Header.Get("Content-Type")
	validTypes := map[string]bool{
		"image/jpeg":           true,
		"image/png":            true,
		"image/gif":            true,
		"video/mp4":            true,
		"video/quicktime":      true, // .mov
		"video/x-msvideo":      true, // .avi
		"video/webm":           true,
	}

	if !validTypes[contentType] {
		http.Error(w, `{"error": "Invalid file type. Only JPEG, PNG, GIF, MP4, MOV, AVI, and WebM are allowed"}`, http.StatusBadRequest)
		return
	}

	// Create uploads directory if not exists
	uploadDir := "./uploads"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		http.Error(w, `{"error": "Failed to create upload directory"}`, http.StatusInternalServerError)
		return
	}

	// Generate unique filename
	timestamp := time.Now().Unix()
	ext := filepath.Ext(handler.Filename)
	filename := fmt.Sprintf("%d-%d%s", claims.UserID, timestamp, ext)
	filePath := filepath.Join(uploadDir, filename)

	// Save file to disk
	dst, err := os.Create(filePath)
	if err != nil {
		http.Error(w, `{"error": "Failed to save file"}`, http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, `{"error": "Failed to write file"}`, http.StatusInternalServerError)
		return
	}

	// Determine file type
	fileType := entity.FileTypePhoto
	if strings.HasPrefix(contentType, "video/") {
		fileType = entity.FileTypeVideo
	}

	caption := r.FormValue("caption")

	// Create database record
	gallery := &entity.Gallery{
		UserID:   claims.UserID,
		FileType: fileType,
		FilePath: "/uploads/" + filename, // Store relative path for serving
		Caption:  caption,
	}

	if err := h.galleryRepo.Create(r.Context(), gallery); err != nil {
		// Delete uploaded file if database insert fails
		os.Remove(filePath)
		http.Error(w, `{"error": "Failed to create gallery item"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
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
