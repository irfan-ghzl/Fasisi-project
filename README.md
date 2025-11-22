# Dating Web Application - Fasisi Project

Platform dating khusus untuk **Irfan dan Sisti** dengan fitur lengkap untuk menyimpan kenangan, merencanakan kencan, dan berkomunikasi real-time.

## 🚀 Quick Start dengan Docker Compose

**Cara termudah untuk menjalankan aplikasi:**

```bash
# Start semua services (PostgreSQL + Backend + Frontend)
docker compose up -d

# Akses aplikasi
# - Frontend (React): http://localhost:3000
# - Backend API: http://localhost:8080
# - Health check: http://localhost:8080/api/health

# Lihat logs
docker compose logs -f

# Lihat logs spesifik service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Stop services
docker compose down

# Stop dan hapus volumes (data akan hilang)
docker compose down -v
```

**Default Login:**
- **Irfan**: `irfan@fasisi.com` / `irfan123` (super admin)
- **Sisti**: `sisti@fasisi.com` / `sisti123` (user)

## 🐳 Running Docker Containers Separately

### Run Backend Only

**Prerequisites:**
- PostgreSQL harus sudah running (Docker atau native)

**Steps:**

```bash
# 1. Setup PostgreSQL (jika belum ada)
docker run -d \
  --name fasisi-postgres \
  -e POSTGRES_USER=fasisi_user \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=fasisi_db \
  -p 5432:5432 \
  postgres:15-alpine

# 2. Configure backend environment
cd backend
cp .env.example .env
# Edit .env dengan database credentials

# 3. Build backend image
docker build -t fasisi-backend .

# 4. Run backend container
docker run -d \
  --name fasisi-backend \
  -p 8080:8080 \
  --env-file .env \
  --network host \
  fasisi-backend

# 5. Test backend
curl http://localhost:8080/api/health
```

**Backend Management:**
```bash
# View logs
docker logs -f fasisi-backend

# Restart
docker restart fasisi-backend

# Stop
docker stop fasisi-backend

# Rebuild
docker build -t fasisi-backend backend/ && \
docker rm -f fasisi-backend && \
docker run -d --name fasisi-backend -p 8080:8080 --env-file backend/.env --network host fasisi-backend
```

### Run Frontend Only

**Prerequisites:**
- Backend harus sudah running di http://localhost:8080

**Steps:**

```bash
# 1. Build frontend image
cd frontend
docker build -t fasisi-frontend .

# 2. Run frontend container
docker run -d \
  --name fasisi-frontend \
  -p 3000:80 \
  fasisi-frontend

# 3. Akses aplikasi
# http://localhost:3000
```

**Frontend Management:**
```bash
# View logs
docker logs -f fasisi-frontend

# Restart
docker restart fasisi-frontend

# Stop
docker stop fasisi-frontend

# Rebuild
docker build -t fasisi-frontend frontend/ && \
docker rm -f fasisi-frontend && \
docker run -d --name fasisi-frontend -p 3000:80 fasisi-frontend
```

### Run Backend + Frontend (tanpa Docker Compose)

**Using Docker Network:**

```bash
# 1. Create network
docker network create fasisi-network

# 2. Run PostgreSQL
docker run -d \
  --name fasisi-postgres \
  --network fasisi-network \
  -e POSTGRES_USER=fasisi_user \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=fasisi_db \
  -p 5432:5432 \
  postgres:15-alpine

# 3. Run Backend
cd backend
docker build -t fasisi-backend .
docker run -d \
  --name fasisi-backend \
  --network fasisi-network \
  -p 8080:8080 \
  -e DB_HOST=fasisi-postgres \
  -e DB_PORT=5432 \
  -e DB_USER=fasisi_user \
  -e DB_PASSWORD=your_password \
  -e DB_NAME=fasisi_db \
  -e JWT_SECRET=your-secret-key \
  fasisi-backend

# 4. Run Frontend
cd ../frontend
docker build -t fasisi-frontend .
docker run -d \
  --name fasisi-frontend \
  --network fasisi-network \
  -p 3000:80 \
  fasisi-frontend

# 5. Access
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
```

**Clean Up:**
```bash
# Stop all containers
docker stop fasisi-frontend fasisi-backend fasisi-postgres

# Remove containers
docker rm fasisi-frontend fasisi-backend fasisi-postgres

# Remove network
docker network rm fasisi-network

# Remove images (optional)
docker rmi fasisi-frontend fasisi-backend
```

### Docker Troubleshooting

**Check running containers:**
```bash
docker ps
```

**Check all containers (including stopped):**
```bash
docker ps -a
```

**View container logs:**
```bash
docker logs fasisi-backend
docker logs fasisi-frontend
docker logs fasisi-postgres
```

**Inspect container:**
```bash
docker inspect fasisi-backend
```

**Execute command in container:**
```bash
# Access backend shell
docker exec -it fasisi-backend sh

# Access PostgreSQL
docker exec -it fasisi-postgres psql -U fasisi_user -d fasisi_db
```

**Check container resource usage:**
```bash
docker stats
```

**Remove all stopped containers:**
```bash
docker container prune
```

📖 **Dokumentasi Lengkap:**
- [Backend Docker Guide](./backend/README.md#option-2-docker-backend-only)
- [Frontend Docker Guide](./frontend/README.md#option-2-docker-frontend-only)

## 🏗️ Architecture

Project ini memiliki **2 folder utama**:

### 1. **Backend** (`backend/`) - Golang dengan DDD
- **Language**: Go 1.21+
- **Architecture**: Domain-Driven Design (DDD)
- **Database**: PostgreSQL 15 dengan migration system
- **Port**: 8080
- **Features**: JWT auth, repository pattern, super admin, embedded migrations

[📖 Dokumentasi Backend](./backend/README.md)

### 2. **Frontend** (`frontend/`) - React Application
- **Framework**: React 18
- **Build Tool**: Vite
- **Port**: 3000
- **Features**: Component-based, protected routes, responsive

[📖 Dokumentasi Frontend](./frontend/README.md)

## 👥 Fixed Users

1. **Irfan** (Super Admin) - `irfan@fasisi.com` / `irfan123`
2. **Sisti** (User) - `sisti@fasisi.com` / `sisti123`

## ✨ Features

- 📷 **Gallery** - Upload & lihat foto/video
- 🎯 **Date Requests** - Request tempat jalan atau makan
- 💬 **Chat** - Real-time messaging
- 🔔 **Notifications** - Email & SMS notifications

## 📦 Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | **Go 1.21+ (DDD)** |
| Frontend | **React 18 + Vite** |
| Database | **PostgreSQL 15** |
| Deployment | **Docker Compose** |

## 🔒 Security

- JWT Authentication
- Bcrypt password hashing
- PostgreSQL parameterized queries
- Admin middleware
- CodeQL: 0 alerts

---

Made with ❤️ for Irfan & Sisti
