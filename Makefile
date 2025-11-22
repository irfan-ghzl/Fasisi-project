.PHONY: help up down build logs restart clean status

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

up: ## Start all services
	docker compose up -d
	@echo "✓ Services started!"
	@echo "  Backend API: http://localhost:8080"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Health check: http://localhost:8080/api/health"

down: ## Stop all services
	docker compose down

build: ## Build/rebuild all services
	docker compose build --no-cache

rebuild: ## Rebuild and restart all services
	docker compose up -d --build

logs: ## View logs from all services
	docker compose logs -f

logs-backend: ## View backend logs only
	docker compose logs -f backend

logs-postgres: ## View PostgreSQL logs only
	docker compose logs -f postgres

logs-frontend: ## View frontend logs only
	docker compose logs -f frontend

restart: ## Restart all services
	docker compose restart

restart-backend: ## Restart backend only
	docker compose restart backend

status: ## Show status of all services
	docker compose ps

clean: ## Stop services and remove volumes
	docker compose down -v
	@echo "✓ All services stopped and volumes removed"

shell-backend: ## Open shell in backend container
	docker compose exec backend sh

shell-postgres: ## Open PostgreSQL shell
	docker compose exec postgres psql -U fasisi_user -d fasisi_db

shell-frontend: ## Open shell in frontend container
	docker compose exec frontend sh

dev: ## Start in development mode with live logs
	docker compose up --build
