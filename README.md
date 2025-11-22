# Dating Web Application - Fasisi Project

Platform dating khusus untuk Irfan dan Sisti dengan fitur lengkap untuk menyimpan kenangan, merencanakan kencan, dan berkomunikasi.

## 🏗️ Architecture

This project now has **TWO BACKENDS**:

### 1. **Golang Backend (NEW)** - DDD with PostgreSQL
- Location: `backend-go/`
- Architecture: Domain-Driven Design (DDD)
- Database: PostgreSQL
- Fixed users: **Irfan (super admin)** and **Sisti (user)**
- Language: Go 1.21+
- [See backend-go/README.md for details](./backend-go/README.md)

### 2. **Node.js Backend (Legacy)** - Express with SQLite
- Location: `server.js`, `src/`
- Architecture: MVC
- Database: SQLite
- Language: Node.js
- Frontend: `views/`, `public/`

## 👥 Fixed Users

This system is designed for **only two users**:

1. **Irfan** (Super Admin)
   - Email: `irfan@fasisi.com`
   - Role: `super_admin`
   - Can delete any content and manage all features

2. **Sisti** (User)
   - Email: `sisti@fasisi.com`
   - Role: `user`
   - Can create and manage own content

## ✨ Fitur

### 1. 📷 Galeri
- Upload foto dan video kenangan bersama
- Preview media dengan tampilan grid yang menarik
- Caption untuk setiap media
- Hapus media yang sudah di-upload

### 2. 🎯 Request Kencan
- Buat request untuk tempat jalan atau makan
- Tambahkan deskripsi dan lokasi
- Status approval (pending, approved, rejected)
- Notifikasi otomatis ke pasangan

### 3. 💬 Chat Real-time
- Chat langsung dengan pasangan
- Real-time messaging menggunakan Socket.io
- Indikator pesan belum dibaca
- Riwayat chat tersimpan

### 4. 🔔 Notifikasi
- Notifikasi untuk request baru
- Notifikasi untuk pesan chat baru
- Kirim notifikasi ke email dan SMS
- Dashboard notifikasi dengan status read/unread

## 🚀 Teknologi

**Backend:**
- Node.js & Express.js
- SQLite Database
- Socket.io untuk real-time chat
- JWT untuk authentication
- Bcrypt untuk password hashing
- Multer untuk file upload
- Nodemailer untuk email notifications

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Socket.io client
- Responsive design

## 📦 Installation

1. Clone repository:
```bash
git clone https://github.com/irfan-ghzl/Fasisi-project.git
cd Fasisi-project
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env
```

Edit `.env` file dan sesuaikan dengan konfigurasi Anda:
```env
PORT=3000
JWT_SECRET=your-secret-key-change-this-in-production

# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# SMS Configuration (Optional - Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

4. Start server:
```bash
npm start
```

5. Buka browser dan akses:
```
http://localhost:3000
```

## 🔧 Konfigurasi Email

Untuk mengaktifkan notifikasi email, Anda perlu:

1. **Menggunakan Gmail:**
   - Aktifkan 2-Factor Authentication di akun Gmail
   - Generate App Password di https://myaccount.google.com/apppasswords
   - Gunakan App Password sebagai `EMAIL_PASSWORD` di `.env`

2. **Menggunakan email service lain:**
   - Update `EMAIL_SERVICE` di `.env`
   - Sesuaikan kredensial email

## 📱 Konfigurasi SMS (Optional)

Untuk mengaktifkan notifikasi SMS:

1. Daftar akun di [Twilio](https://www.twilio.com)
2. Dapatkan Account SID dan Auth Token
3. Dapatkan nomor telepon Twilio
4. Update kredensial Twilio di `.env`

## 📖 API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "phone": "string",
  "password": "string"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

### Gallery

#### Get Gallery Items
```http
GET /api/gallery
Authorization: Bearer {token}
```

#### Upload Media
```http
POST /api/gallery/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [File]
caption: string (optional)
```

#### Delete Media
```http
DELETE /api/gallery/:id
Authorization: Bearer {token}
```

### Date Requests

#### Get Requests
```http
GET /api/requests
Authorization: Bearer {token}
```

#### Create Request
```http
POST /api/requests
Authorization: Bearer {token}
Content-Type: application/json

{
  "request_type": "place" | "food",
  "title": "string",
  "description": "string",
  "location": "string"
}
```

#### Update Request Status
```http
PATCH /api/requests/:id/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "pending" | "approved" | "rejected"
}
```

#### Delete Request
```http
DELETE /api/requests/:id
Authorization: Bearer {token}
```

### Chat

#### Get Chat History
```http
GET /api/chat/history/:partnerId
Authorization: Bearer {token}
```

#### Send Message
```http
POST /api/chat/send
Authorization: Bearer {token}
Content-Type: application/json

{
  "receiverId": number,
  "message": "string"
}
```

#### Mark Messages as Read
```http
PATCH /api/chat/read/:partnerId
Authorization: Bearer {token}
```

#### Get Unread Count
```http
GET /api/chat/unread-count
Authorization: Bearer {token}
```

### Notifications

#### Get Notifications
```http
GET /api/notifications
Authorization: Bearer {token}
```

#### Mark Notification as Read
```http
PATCH /api/notifications/:id/read
Authorization: Bearer {token}
```

#### Mark All as Read
```http
PATCH /api/notifications/read-all
Authorization: Bearer {token}
```

#### Get Unread Count
```http
GET /api/notifications/unread-count
Authorization: Bearer {token}
```

## 🗄️ Database Schema

### Users
- id (PRIMARY KEY)
- username (UNIQUE)
- email (UNIQUE)
- phone
- password_hash
- created_at

### Gallery
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- file_type (photo/video)
- file_path
- caption
- created_at

### Date Requests
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- request_type (place/food)
- title
- description
- location
- status (pending/approved/rejected)
- created_at

### Chat Messages
- id (PRIMARY KEY)
- sender_id (FOREIGN KEY)
- receiver_id (FOREIGN KEY)
- message
- read_status
- created_at

### Notifications
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- type
- message
- read_status
- sent_email
- sent_sms
- created_at

## 🎨 Fitur UI

- ✅ Responsive design untuk mobile dan desktop
- ✅ Modern gradient background
- ✅ Smooth animations dan transitions
- ✅ Real-time chat dengan Socket.io
- ✅ Badge untuk notifikasi dan chat yang belum dibaca
- ✅ Form validation
- ✅ Loading states
- ✅ Empty states untuk data kosong

## 🔐 Security

- Password di-hash menggunakan bcrypt
- JWT token untuk authentication
- Input validation
- File upload validation (type & size)
- SQL injection prevention dengan parameterized queries
- CORS enabled

## 🤝 Contributing

Pull requests are welcome! Untuk perubahan besar, silakan buka issue terlebih dahulu untuk diskusi.

## 📝 License

ISC

## 👨‍💻 Author

Created with ❤️ for couples everywhere