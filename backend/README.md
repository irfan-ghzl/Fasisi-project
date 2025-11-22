# Golang Backend with DDD Architecture

This is the new Golang backend using Domain-Driven Design (DDD) architecture with PostgreSQL database.

## 🏗️ Architecture

### Domain-Driven Design Layers

```
backend-go/
├── cmd/api/              # Application entry point
│   └── main.go
├── internal/
│   ├── domain/           # Domain layer (entities, repositories, services)
│   │   ├── entity/       # Domain entities (User, Gallery, Request, Chat, Notification)
│   │   ├── repository/   # Repository interfaces
│   │   └── service/      # Domain services (Auth, JWT)
│   ├── application/      # Application layer (use cases)
│   │   └── usecase/
│   └── infrastructure/   # Infrastructure layer
│       ├── database/     # PostgreSQL implementations
│       └── http/         # HTTP handlers, middleware, routers
└── config/               # Configuration
```

### Key Features

- **PostgreSQL Database** - Reliable RDBMS with ACID compliance
- **DDD Architecture** - Clean separation of concerns
- **Fixed Users** - Only Irfan (super admin) and Sisti (user)
- **JWT Authentication** - Secure token-based auth
- **Super Admin Features** - Irfan has admin privileges

## 👥 Fixed Users

This system is designed for only two users:

1. **Irfan** (Super Admin)
   - Email: `irfan@fasisi.com`
   - Default Password: `irfan123`
   - Role: `super_admin`
   - Can delete any content, manage all features

2. **Sisti** (User)
   - Email: `sisti@fasisi.com`
   - Default Password: `sisti123`
   - Role: `user`
   - Can create and manage own content

## 🚀 Getting Started

### Option 1: Docker (Recommended)

**Easiest way to run the application:**

```bash
# From project root
docker compose up -d

# Access the application
# - Backend API: http://localhost:8080
# - Frontend: http://localhost:3000
# - Health check: http://localhost:8080/api/health

# View logs
docker compose logs -f backend

# Stop services
docker compose down
```

**Using Makefile (from project root):**
```bash
make up      # Start all services
make logs    # View logs
make down    # Stop services
make help    # Show all commands
```

See [DOCKER.md](../DOCKER.md) in project root for complete guide.

### Option 2: Manual Installation

### Prerequisites

- Go 1.21 or higher
- PostgreSQL 13 or higher

### Installation

1. **Install PostgreSQL** (if not installed)

```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Start PostgreSQL
sudo service postgresql start  # Linux
brew services start postgresql # macOS
```

2. **Create Database**

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE fasisi_db;
CREATE USER fasisi_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE fasisi_db TO fasisi_user;
\q
```

3. **Configure Environment**

```bash
cd backend-go
cp .env.example .env
# Edit .env with your database credentials
```

4. **Install Dependencies**

```bash
go mod download
```

5. **Run Server**

```bash
go run cmd/api/main.go
```

The server will start on `http://localhost:8080`

### Database Schema

The application uses an embedded migration system that automatically creates and manages the database schema. Migrations are embedded in the binary and run automatically on startup.

**Migration Files:**
- Located in: `internal/infrastructure/database/migrations/`
- Embedded in the binary using Go's `embed` package
- Automatically executed on application start

**Database Tables:**
- `schema_migrations` - Tracks applied migrations
- `users` - User accounts (only Irfan and Sisti)
- `gallery` - Photos and videos
- `date_requests` - Date planning requests
- `chat_messages` - Chat messages between users
- `notifications` - System notifications

**See** `internal/infrastructure/database/migrations/README.md` for detailed migration documentation.

## 📡 API Endpoints

### Authentication

```bash
# Login
POST /api/auth/login
{
  "email": "irfan@fasisi.com",
  "password": "irfan123"
}

# Get Profile
GET /api/auth/profile
Authorization: Bearer <token>
```

### Gallery

```bash
# Get all gallery items
GET /api/gallery
Authorization: Bearer <token>

# Upload media
POST /api/gallery/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

# Delete media
DELETE /api/gallery/{id}
Authorization: Bearer <token>
```

### Date Requests

```bash
# Get all requests
GET /api/requests
Authorization: Bearer <token>

# Create request
POST /api/requests
Authorization: Bearer <token>
{
  "request_type": "place",
  "title": "Pantai Bali",
  "description": "Ayo liburan ke Bali",
  "location": "Bali, Indonesia"
}

# Update request status
PATCH /api/requests/{id}/status
Authorization: Bearer <token>
{
  "status": "approved"
}

# Delete request
DELETE /api/requests/{id}
Authorization: Bearer <token>
```

## 🔐 Super Admin Features

Irfan (super admin) has additional privileges:

- Can delete any gallery item (not just own items)
- Can delete any date request (not just own requests)
- Full access to all system features
- Can manage all users' content

## 🏗️ DDD Pattern Implementation

### Domain Layer

- **Entities**: Core business objects (User, Gallery, DateRequest, etc.)
- **Repository Interfaces**: Data access contracts
- **Services**: Business logic (Authentication, JWT)

### Infrastructure Layer

- **PostgreSQL Repositories**: Concrete implementations
- **HTTP Handlers**: REST API endpoints
- **Middleware**: Auth, CORS, Admin checks

### Application Layer

- **Use Cases**: Application-specific business rules

## 🔧 Development

### Build

```bash
go build -o bin/server cmd/api/main.go
```

### Run Binary

```bash
./bin/server
```

### Testing

```bash
go test ./...
```

## 🔒 Security

- JWT tokens with 7-day expiration
- Bcrypt password hashing
- PostgreSQL parameterized queries (SQL injection prevention)
- CORS middleware
- Admin middleware for protected routes

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 8080 |
| JWT_SECRET | JWT signing secret | (required) |
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | (required) |
| DB_NAME | Database name | fasisi_db |

## 🎯 Design Decisions

1. **Fixed Users**: System hardcoded for Irfan and Sisti only
2. **PostgreSQL**: More robust than SQLite for production use
3. **DDD Architecture**: Clean separation of business logic
4. **Go**: High performance, compiled language
5. **Super Admin**: Irfan has elevated privileges

## 📦 Dependencies

- `github.com/lib/pq` - PostgreSQL driver
- `github.com/gorilla/mux` - HTTP router
- `github.com/golang-jwt/jwt/v5` - JWT implementation
- `golang.org/x/crypto` - Bcrypt password hashing
