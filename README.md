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

# Stop services
docker compose down
```

**Default Login:**
- **Irfan**: `irfan@fasisi.com` / `irfan123` (super admin)
- **Sisti**: `sisti@fasisi.com` / `sisti123` (user)

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
