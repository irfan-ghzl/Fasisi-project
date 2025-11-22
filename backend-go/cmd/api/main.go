package main

import (
	"context"
	"log"
	"net/http"

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

	// Initialize schema
	ctx := context.Background()
	if err := db.InitSchema(ctx); err != nil {
		log.Fatal("Failed to initialize schema:", err)
	}

	// Initialize fixed users (Irfan and Sisti)
	if err := initializeUsers(ctx, db); err != nil {
		log.Println("Note: Users may already exist:", err)
	}

	// Initialize repositories
	userRepo := database.NewUserRepository(db)
	galleryRepo := database.NewGalleryRepository(db)
	requestRepo := database.NewDateRequestRepository(db)
	notifRepo := database.NewNotificationRepository(db)

	// Initialize services
	authService := service.NewAuthService(cfg.JWTSecret)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(userRepo, authService)
	galleryHandler := handler.NewGalleryHandler(galleryRepo)
	requestHandler := handler.NewRequestHandler(requestRepo, notifRepo)

	// Setup routes
	authMiddleware := middleware.AuthMiddleware(authService)
	adminMiddleware := middleware.AdminMiddleware
	r := router.SetupRoutes(authHandler, galleryHandler, requestHandler, authMiddleware, adminMiddleware)

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
