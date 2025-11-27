package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/irfan-ghzl/fasisi-backend/config"
	"github.com/irfan-ghzl/fasisi-backend/internal/domain/entity"
	"github.com/irfan-ghzl/fasisi-backend/internal/domain/service"
	"github.com/irfan-ghzl/fasisi-backend/internal/infrastructure/database"
	"github.com/irfan-ghzl/fasisi-backend/internal/infrastructure/http/handler"
	"github.com/irfan-ghzl/fasisi-backend/internal/infrastructure/http/middleware"
	"github.com/irfan-ghzl/fasisi-backend/internal/infrastructure/http/router"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Initialize PostgreSQL
	db, err := database.NewPostgresDB(
		cfg.DBHost,
		cfg.DBPort,
		cfg.DBUser,
		cfg.DBPassword,
		cfg.DBName,
	)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Run database migrations
	ctx := context.Background()
	log.Println("Running database migrations...")
	if err := db.RunMigrations(ctx); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}
	log.Println("Database migrations completed successfully")

	// Create uploads directory if it doesn't exist
	if err := os.MkdirAll("./uploads", 0755); err != nil {
		log.Fatal("Failed to create uploads directory:", err)
	}
	log.Println("Uploads directory ready")

	// Initialize fixed users (Irfan and Sisti)
	if err := initializeUsers(ctx, db); err != nil {
		log.Println("Note: Users may already exist:", err)
	}

	// Initialize repositories
	userRepo := database.NewUserRepository(db)
	galleryRepo := database.NewGalleryRepository(db)
	requestRepo := database.NewDateRequestRepository(db)
	notifRepo := database.NewNotificationRepository(db)
	chatRepo := database.NewChatRepository(db)

	// Initialize services
	authService := service.NewAuthService(cfg.JWTSecret)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(userRepo, authService)
	galleryHandler := handler.NewGalleryHandler(galleryRepo, notifRepo)
	requestHandler := handler.NewRequestHandler(requestRepo, notifRepo)
	chatHandler := handler.NewChatHandler(chatRepo, notifRepo)
	notificationHandler := handler.NewNotificationHandler(notifRepo)

	// Setup routes
	authMiddleware := middleware.AuthMiddleware(authService)
	adminMiddleware := middleware.AdminMiddleware
	r := router.SetupRoutes(authHandler, galleryHandler, requestHandler, chatHandler, notificationHandler, authMiddleware, adminMiddleware)

	// Start server
	log.Printf("Server starting on port %s", cfg.ServerPort)
	log.Printf("Visit http://localhost:%s to access the application", cfg.ServerPort)
	if err := http.ListenAndServe(":"+cfg.ServerPort, r); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}

func initializeUsers(ctx context.Context, db *database.PostgresDB) error {
	authService := service.NewAuthService("temp")

	// Create Irfan (Super Admin)
	irfanHash, _ := authService.HashPassword("irfan123")
	irfan := &entity.User{
		Username:     "irfan",
		Email:        "irfan@fasisi.com",
		Phone:        "+6281234567890",
		PasswordHash: irfanHash,
		Role:         entity.RoleSuperAdmin,
	}

	// Create Sisti (User)
	sistiHash, _ := authService.HashPassword("sisti123")
	sisti := &entity.User{
		Username:     "sisti",
		Email:        "sisti@fasisi.com",
		Phone:        "+6289876543210",
		PasswordHash: sistiHash,
		Role:         entity.RoleUser,
	}

	userRepo := database.NewUserRepository(db)
	userRepo.Create(ctx, irfan)
	userRepo.Create(ctx, sisti)

	log.Println("Initialized users: irfan (super_admin) and sisti (user)")
	log.Println("Default passwords: irfan123, sisti123")
	return nil
}
