# Frontend - Dating App (React)

Frontend aplikasi dating untuk Irfan dan Sisti menggunakan React.

## 🏗️ Tech Stack

- **React 18** - UI Library
- **React Router** - Routing
- **Axios** - HTTP Client
- **Socket.IO Client** - Real-time communication
- **Vite** - Build tool & dev server

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
│   └── index.html
├── src/
│   ├── components/      # React components
│   │   ├── Auth/       # Login & Register
│   │   ├── Dashboard/  # Dashboard
│   │   ├── Gallery/    # Gallery
│   │   ├── Requests/   # Date requests
│   │   ├── Chat/       # Chat
│   │   └── Notifications/
│   ├── services/        # API services
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utility functions
│   ├── assets/          # CSS, images
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── Dockerfile           # Docker build
├── nginx.conf           # Nginx config for production
└── vite.config.js       # Vite configuration
```

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

**Run all services together (PostgreSQL + Backend + Frontend):**

```bash
# From project root
cd ..
docker compose up -d

# Access the application
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8080

# View logs
docker compose logs -f frontend

# Stop services
docker compose down
```

### Option 2: Docker Frontend Only

**Run only the frontend with Docker** (requires backend already running at http://localhost:8080):

**Step 1: Build Frontend Docker Image**

```bash
# From frontend directory
docker build -t fasisi-frontend .
```

The build process:
1. Stage 1 (build): Installs dependencies and builds React app with Vite
2. Stage 2 (production): Copies built files to Nginx Alpine image

**Step 2: Run Frontend Container**

```bash
# Run frontend container
docker run -d \
  --name fasisi-frontend \
  -p 3000:80 \
  fasisi-frontend
```

**With custom backend URL:**

```bash
# If backend is on different host/port
docker run -d \
  --name fasisi-frontend \
  -p 3000:80 \
  -e VITE_API_BASE_URL=http://your-backend-host:8080 \
  fasisi-frontend
```

**Step 3: Verify Frontend is Running**

```bash
# Check container logs
docker logs fasisi-frontend

# Open browser
# http://localhost:3000
```

**Managing Frontend Container:**

```bash
# View logs
docker logs fasisi-frontend

# Follow logs
docker logs -f fasisi-frontend

# Stop frontend
docker stop fasisi-frontend

# Start frontend
docker start fasisi-frontend

# Restart frontend
docker restart fasisi-frontend

# Remove frontend container
docker rm -f fasisi-frontend

# Rebuild and run
docker build -t fasisi-frontend . && \
docker rm -f fasisi-frontend && \
docker run -d --name fasisi-frontend -p 3000:80 fasisi-frontend
```

**Frontend + Backend in Docker Network:**

If running both frontend and backend in Docker, create a network:

```bash
# Create network
docker network create fasisi-network

# Run backend on network
docker run -d \
  --name fasisi-backend \
  --network fasisi-network \
  -p 8080:8080 \
  --env-file backend/.env \
  fasisi-backend

# Run frontend on same network
docker run -d \
  --name fasisi-frontend \
  --network fasisi-network \
  -p 3000:80 \
  fasisi-frontend

# Frontend will communicate with backend via http://fasisi-backend:8080
```

### Option 3: Development Mode (Without Docker)

**Local development with hot reload:**

```bash
cd frontend
npm install
npm run dev
```

Server akan berjalan di http://localhost:3000

### Option 4: Production Build (Without Docker)

**Build for production:**

```bash
npm run build
```

Output akan ada di folder `dist/`

**Preview production build:**

```bash
npm run preview
```

**Serve with simple HTTP server:**

```bash
# Using npx
npx serve -s dist -l 3000

# Or install serve globally
npm install -g serve
serve -s dist -l 3000
```

## 🔧 Configuration

### API Proxy

Vite dikonfigurasi untuk proxy request `/api/*` ke backend Golang di port 8080.

Development: otomatis via `vite.config.js`  
Production: via Nginx config

### Environment Variables

Create `.env` file (optional):
```env
VITE_API_BASE_URL=http://localhost:8080
```

## 📡 API Integration

Frontend berkomunikasi dengan Golang backend:

**Base URL**: `http://localhost:8080/api`

**Endpoints**:
- `POST /auth/login` - Login
- `GET /auth/profile` - Get user profile
- `GET /gallery` - Get gallery
- `POST /gallery/upload` - Upload media
- `GET /requests` - Get date requests
- `POST /requests` - Create request

## 🎨 Features

- ✅ React Router untuk navigasi
- ✅ Protected routes dengan authentication
- ✅ Responsive design
- ✅ Component-based architecture
- ✅ API integration dengan Axios
- ✅ Real-time dengan Socket.IO (ready)

## 📱 Responsive

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔐 Authentication

JWT token disimpan di localStorage:
- `authToken` - JWT token
- `currentUser` - User data

## 🚀 Deployment

### Static Hosting
Build dapat di-deploy ke:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### With Nginx
Gunakan Dockerfile yang sudah ada untuk production deployment dengan Nginx.

## 📝 Code Style

- Use functional components
- Use hooks untuk state management
- Arrow functions
- Destructuring
- Template literals

## 🔄 State Management

Currently menggunakan:
- React useState untuk local state
- localStorage untuk persistence
- Context API ready untuk global state (future)

## 🎯 Future Enhancements

- [ ] TypeScript
- [ ] State management (Redux/Zustand)
- [ ] Unit testing (Vitest)
- [ ] E2E testing (Playwright)
- [ ] PWA support
- [ ] Lazy loading components
- [ ] Image optimization
