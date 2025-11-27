package router

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/irfan-ghzl/fasisi-backend/internal/infrastructure/http/handler"
	"github.com/irfan-ghzl/fasisi-backend/internal/infrastructure/http/middleware"
)

// SetupRoutes configures all API routes
func SetupRoutes(
	authHandler *handler.AuthHandler,
	galleryHandler *handler.GalleryHandler,
	requestHandler *handler.RequestHandler,
	chatHandler *handler.ChatHandler,
	authMiddleware func(http.Handler) http.Handler,
	adminMiddleware func(http.Handler) http.Handler,
) *mux.Router {
	r := mux.NewRouter()

	// Apply CORS middleware
	r.Use(middleware.CORSMiddleware)

	// Health check
	r.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"OK","message":"Server is running"}`))
	}).Methods("GET")

	// Auth routes
	r.HandleFunc("/api/auth/login", authHandler.Login).Methods("POST")
	r.Handle("/api/auth/profile", authMiddleware(http.HandlerFunc(authHandler.GetProfile))).Methods("GET")

	// Gallery routes
	r.Handle("/api/gallery", authMiddleware(http.HandlerFunc(galleryHandler.GetAll))).Methods("GET")
	r.Handle("/api/gallery/upload", authMiddleware(http.HandlerFunc(galleryHandler.Create))).Methods("POST")
	r.Handle("/api/gallery/{id}", authMiddleware(http.HandlerFunc(galleryHandler.Delete))).Methods("DELETE")

	// Request routes
	r.Handle("/api/requests", authMiddleware(http.HandlerFunc(requestHandler.GetAll))).Methods("GET")
	r.Handle("/api/requests", authMiddleware(http.HandlerFunc(requestHandler.Create))).Methods("POST")
	r.Handle("/api/requests/{id}/status", authMiddleware(http.HandlerFunc(requestHandler.UpdateStatus))).Methods("PATCH")
	r.Handle("/api/requests/{id}", authMiddleware(http.HandlerFunc(requestHandler.Delete))).Methods("DELETE")

	// Chat routes
	r.Handle("/api/chat/messages", authMiddleware(http.HandlerFunc(chatHandler.GetHistory))).Methods("GET")
	r.Handle("/api/chat/messages", authMiddleware(http.HandlerFunc(chatHandler.SendMessage))).Methods("POST")
	r.Handle("/api/chat/messages/read", authMiddleware(http.HandlerFunc(chatHandler.MarkAsRead))).Methods("POST")
	r.Handle("/api/chat/unread", authMiddleware(http.HandlerFunc(chatHandler.GetUnreadCount))).Methods("GET")

	// Static files for uploads (gallery photos/videos)
	// Serve files from ./uploads directory at /uploads URL path
	r.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads"))))

	return r
}
