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

### Development

```bash
cd frontend
npm install
npm run dev
```

Server akan berjalan di http://localhost:3000

### Build Production

```bash
npm run build
```

Output akan ada di folder `dist/`

### Preview Production Build

```bash
npm run preview
```

## 🐳 Docker

Build dan run dengan Docker:

```bash
docker build -t fasisi-frontend .
docker run -p 3000:80 fasisi-frontend
```

Atau gunakan docker-compose dari root project:

```bash
cd ..
docker compose up -d
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
