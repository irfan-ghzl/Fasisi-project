# Docker Compose - Quick Start Guide

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

### Running the Application

1. **Start all services:**
```bash
docker-compose up -d
```

2. **View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f frontend
```

3. **Access the application:**
- **Golang Backend API:** http://localhost:8080
- **Frontend:** http://localhost:3000
- **PostgreSQL:** localhost:5432

4. **Stop all services:**
```bash
docker-compose down
```

5. **Stop and remove all data:**
```bash
docker-compose down -v
```

## 📦 Services

### 1. PostgreSQL Database
- **Port:** 5432
- **Database:** fasisi_db
- **User:** fasisi_user
- **Password:** fasisi_password
- **Data persisted in:** Docker volume `postgres_data`

### 2. Golang Backend (DDD)
- **Port:** 8080
- **Health check:** http://localhost:8080/api/health
- **Auto-initializes:** Creates tables and default users (Irfan & Sisti)

### 3. Frontend (Node.js)
- **Port:** 3000
- **UI:** http://localhost:3000

## 🔑 Default Credentials

After starting the services, you can login with:

- **Irfan (Super Admin):**
  - Email: `irfan@fasisi.com`
  - Password: `irfan123`

- **Sisti (User):**
  - Email: `sisti@fasisi.com`
  - Password: `sisti123`

## 🛠️ Development Commands

### Rebuild services after code changes:
```bash
docker-compose up -d --build
```

### Restart a specific service:
```bash
docker-compose restart backend
```

### Execute commands inside containers:
```bash
# Access PostgreSQL
docker-compose exec postgres psql -U fasisi_user -d fasisi_db

# Access backend container
docker-compose exec backend sh

# Access frontend container
docker-compose exec frontend sh
```

### View database:
```bash
docker-compose exec postgres psql -U fasisi_user -d fasisi_db -c "SELECT * FROM users;"
```

## 🔧 Troubleshooting

### Service won't start
```bash
# Check logs
docker-compose logs backend

# Restart service
docker-compose restart backend
```

### Database connection issues
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres
```

### Clean slate (reset everything)
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Start fresh
docker-compose up -d
```

### Port already in use
If you get "port already allocated" error:
```bash
# Stop any services using the ports
# Or change ports in docker-compose.yml

# For example, change backend port:
ports:
  - "8081:8080"  # Host port 8081 → Container port 8080
```

## 📊 Monitoring

### Check service status:
```bash
docker-compose ps
```

### Resource usage:
```bash
docker stats
```

### Network inspection:
```bash
docker network ls
docker network inspect fasisi-project_fasisi-network
```

## 🔒 Production Notes

For production deployment, update:
1. Change `JWT_SECRET` in docker-compose.yml
2. Use strong `DB_PASSWORD`
3. Use environment file instead of inline variables
4. Enable SSL/TLS for PostgreSQL
5. Use production-grade reverse proxy (nginx/traefik)
6. Set up proper backup strategy for PostgreSQL data

## 📝 Environment Variables

Create `.env` file in root directory (optional):
```env
JWT_SECRET=your-super-secret-key
DB_PASSWORD=your-strong-password
```

Then update docker-compose.yml to use:
```yaml
environment:
  JWT_SECRET: ${JWT_SECRET}
  DB_PASSWORD: ${DB_PASSWORD}
```
