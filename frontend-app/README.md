# Frontend - Dating App

Frontend application untuk Fasisi Dating App (Irfan & Sisti).

## 🏗️ Architecture

- **Build Tool**: Vite untuk fast development dan optimized builds
- **JavaScript**: Vanilla JS (no framework dependencies)
- **Styling**: Custom CSS dengan responsive design
- **Real-time**: Socket.IO client untuk chat
- **API Communication**: Fetch API dengan proxy ke backend

## 📁 Project Structure

```
frontend-app/
├── public/              # Static files dan entry point
│   └── index.html      # Main HTML file
├── src/
│   ├── assets/         # Assets (CSS, images)
│   │   └── css/
│   │       └── style.css
│   ├── components/     # Reusable components (future)
│   ├── services/       # API services (future)
│   ├── utils/          # Utility functions (future)
│   └── app.js          # Main application logic
├── config/             # Configuration files
├── vite.config.js      # Vite configuration
└── package.json        # Dependencies
```

## 🚀 Quick Start

### With Docker (Recommended)

From project root:
```bash
docker compose up -d
```

Frontend akan tersedia di http://localhost:3000

### Manual Development

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

Server development akan berjalan di http://localhost:3000 dengan hot reload.

3. **Build for production:**
```bash
npm run build
```

Output akan ada di folder `dist/`

4. **Preview production build:**
```bash
npm run preview
```

## 🔧 Configuration

### API Proxy

Vite dikonfigurasi untuk proxy request `/api/*` ke backend:
- Development: `http://localhost:8080`
- Production: Configure via environment variables

### Environment Variables

Create `.env` file (optional):
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_SOCKET_URL=http://localhost:8080
```

## 📡 API Integration

Frontend berkomunikasi dengan Golang backend:

**Base URL**: `http://localhost:8080/api`

**Endpoints**:
- `POST /auth/login` - Login
- `GET /auth/profile` - Get user profile
- `GET /gallery` - Get all gallery items
- `POST /gallery/upload` - Upload media
- `GET /requests` - Get date requests
- `POST /requests` - Create date request
- `GET /chat/history/:partnerId` - Get chat history
- `POST /chat/send` - Send message

## 🎨 Features

### Pages
- **Auth Page** - Login/Register
- **Gallery** - Photo/video gallery with upload
- **Requests** - Date planning requests
- **Chat** - Real-time messaging
- **Notifications** - System notifications

### UI Components
- Responsive navigation
- Modal dialogs
- Form validation
- Loading states
- Toast notifications
- Empty states

## 🔐 Authentication

Frontend menggunakan JWT token:
1. Login via `/api/auth/login`
2. Store token di `localStorage`
3. Include token dalam header: `Authorization: ******`
4. Auto-redirect ke login jika token expired

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Responsive Design

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🔨 Development Tools

- **Vite**: Fast build tool dengan HMR
- **ESLint**: Code linting (optional)
- **Hot Reload**: Auto-refresh saat development

## 🐳 Docker Support

Dockerfile included untuk production deployment:

```bash
# Build image
docker build -t fasisi-frontend .

# Run container
docker run -p 3000:80 fasisi-frontend
```

## 📦 Build Optimization

Production build includes:
- Code minification
- Asset optimization
- Tree shaking
- Code splitting
- Gzip compression ready

## 🚀 Deployment

### Static Hosting (Recommended)
Build files dapat di-deploy ke:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Nginx/Apache server

### With Backend
Configure reverse proxy untuk serve frontend dan proxy API requests.

## 🔄 State Management

Currently menggunakan vanilla JS dengan:
- `localStorage` untuk persistence
- In-memory state untuk UI
- Socket.IO untuk real-time updates

## 📝 Code Style

- Use ES6+ features
- Async/await untuk async operations
- Arrow functions
- Template literals
- Destructuring

## 🎯 Future Enhancements

- [ ] Add TypeScript
- [ ] Component-based architecture (React/Vue)
- [ ] State management (Redux/Zustand)
- [ ] Unit testing (Jest/Vitest)
- [ ] E2E testing (Playwright)
- [ ] PWA support
- [ ] Offline mode
- [ ] Image optimization
- [ ] Lazy loading

## 📚 Resources

- [Vite Documentation](https://vitejs.dev/)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
