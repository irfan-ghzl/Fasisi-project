// Package handler menyediakan HTTP handlers untuk fitur chat
// Handler ini menangani semua operasi terkait percakapan antara Irfan dan Sisti
package handler

import (
	"encoding/json"
	"net/http"

	"github.com/irfan-ghzl/fasisi-backend/internal/domain/entity"
	"github.com/irfan-ghzl/fasisi-backend/internal/domain/repository"
	"github.com/irfan-ghzl/fasisi-backend/internal/domain/service"
)

// ChatHandler menangani semua request HTTP terkait fitur chat
// Handler ini memfasilitasi komunikasi real-time antara dua pengguna (Irfan & Sisti)
type ChatHandler struct {
	chatRepo repository.ChatRepository // Repository untuk operasi database chat
}

// NewChatHandler membuat instance baru dari ChatHandler
// Parameter:
//   - chatRepo: Repository untuk mengakses data chat di database
// Returns:
//   - Pointer ke ChatHandler yang sudah diinisialisasi
func NewChatHandler(chatRepo repository.ChatRepository) *ChatHandler {
	return &ChatHandler{
		chatRepo: chatRepo,
	}
}

// GetHistory mengambil riwayat percakapan antara user yang sedang login dengan pasangannya
// Endpoint: GET /api/chat/messages
// Authentication: Membutuhkan JWT token
// 
// Cara kerja:
// 1. Mengambil user ID dari JWT token
// 2. Menentukan partner ID (jika user 1 maka partner adalah user 2, begitu sebaliknya)
// 3. Mengambil semua pesan antara kedua user dari database
// 4. Mengirim response berupa array pesan dalam format JSON
//
// Response:
//   - 200 OK: Array pesan berhasil diambil
//   - 500 Internal Server Error: Gagal mengambil pesan dari database
func (h *ChatHandler) GetHistory(w http.ResponseWriter, r *http.Request) {
	// Ambil user claims dari context (sudah diset oleh auth middleware)
	claims, _ := r.Context().Value("user").(*service.Claims)

	// Tentukan partner ID
	// Sistem ini hanya untuk 2 user: Irfan (ID=1) dan Sisti (ID=2)
	partnerID := int64(1)
	if claims.UserID == 1 {
		partnerID = 2
	}

	// Ambil riwayat pesan dari database
	messages, err := h.chatRepo.FindHistory(r.Context(), claims.UserID, partnerID)
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch messages"}`, http.StatusInternalServerError)
		return
	}

	// Kirim response dalam format JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

// SendMessageReq adalah struktur request untuk mengirim pesan baru
// Field:
//   - Message: Isi pesan yang akan dikirim (wajib diisi)
type SendMessageReq struct {
	Message string `json:"message"`
}

// SendMessage mengirim pesan baru dari user yang sedang login ke pasangannya
// Endpoint: POST /api/chat/messages
// Authentication: Membutuhkan JWT token
//
// Request Body:
//   {
//     "message": "Halo sayang, apa kabar?"
//   }
//
// Cara kerja:
// 1. Validasi request body harus berisi message yang tidak kosong
// 2. Menentukan penerima (receiver) berdasarkan ID pengirim
// 3. Menyimpan pesan ke database dengan status read_status = false
// 4. Mengirim response success dengan data pesan yang baru dibuat
//
// Response:
//   - 200 OK: Pesan berhasil dikirim
//   - 400 Bad Request: Request body invalid atau message kosong
//   - 500 Internal Server Error: Gagal menyimpan pesan ke database
func (h *ChatHandler) SendMessage(w http.ResponseWriter, r *http.Request) {
	// Ambil user claims dari JWT token
	claims, _ := r.Context().Value("user").(*service.Claims)

	// Parse request body
	var req SendMessageReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request"}`, http.StatusBadRequest)
		return
	}

	// Validasi: message tidak boleh kosong
	if req.Message == "" {
		http.Error(w, `{"error": "Message cannot be empty"}`, http.StatusBadRequest)
		return
	}

	// Tentukan receiver ID (penerima pesan)
	// Jika pengirim adalah user 1, maka receiver adalah user 2, begitu sebaliknya
	receiverID := int64(1)
	if claims.UserID == 1 {
		receiverID = 2
	}

	// Buat object chat message
	chatMessage := &entity.ChatMessage{
		SenderID:   claims.UserID,  // ID pengirim dari JWT token
		ReceiverID: receiverID,      // ID penerima yang sudah ditentukan
		Message:    req.Message,     // Isi pesan dari request
		ReadStatus: false,           // Default belum dibaca
	}

	// Simpan pesan ke database
	if err := h.chatRepo.Create(r.Context(), chatMessage); err != nil {
		http.Error(w, `{"error": "Failed to send message"}`, http.StatusInternalServerError)
		return
	}

	// Kirim response success
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Message sent successfully",
		"data":    chatMessage,
	})
}

// MarkAsRead menandai pesan-pesan dari partner sebagai sudah dibaca
// Endpoint: POST /api/chat/messages/read
// Authentication: Membutuhkan JWT token
//
// Cara kerja:
// 1. Menentukan partner ID dari user yang sedang login
// 2. Update semua pesan dari partner yang belum dibaca (read_status = false)
// 3. Set read_status menjadi true untuk pesan-pesan tersebut
//
// Use case:
//   - Ketika user membuka halaman chat
//   - Untuk menghilangkan badge unread count
//
// Response:
//   - 200 OK: Pesan berhasil ditandai sebagai sudah dibaca
//   - 500 Internal Server Error: Gagal update status pesan
func (h *ChatHandler) MarkAsRead(w http.ResponseWriter, r *http.Request) {
	// Ambil user claims dari JWT token
	claims, _ := r.Context().Value("user").(*service.Claims)

	// Tentukan partner ID
	partnerID := int64(1)
	if claims.UserID == 1 {
		partnerID = 2
	}

	// Update read_status untuk semua pesan dari partner
	// Parameter: senderID (partner), receiverID (current user)
	if err := h.chatRepo.MarkAsRead(r.Context(), partnerID, claims.UserID); err != nil {
		http.Error(w, `{"error": "Failed to mark messages as read"}`, http.StatusInternalServerError)
		return
	}

	// Kirim response success
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Messages marked as read"})
}

// GetUnreadCount menghitung jumlah pesan yang belum dibaca untuk user saat ini
// Endpoint: GET /api/chat/unread
// Authentication: Membutuhkan JWT token
//
// Cara kerja:
// 1. Menghitung pesan dengan read_status = false
// 2. Yang receiver_id adalah current user
//
// Use case:
//   - Menampilkan badge notifikasi di icon chat
//   - Update unread count secara berkala
//
// Response:
//   {
//     "count": 5
//   }
//
// Response:
//   - 200 OK: Berhasil mengambil jumlah pesan yang belum dibaca
//   - 500 Internal Server Error: Gagal menghitung pesan
func (h *ChatHandler) GetUnreadCount(w http.ResponseWriter, r *http.Request) {
	// Ambil user claims dari JWT token
	claims, _ := r.Context().Value("user").(*service.Claims)

	// Hitung jumlah pesan yang belum dibaca
	count, err := h.chatRepo.CountUnread(r.Context(), claims.UserID)
	if err != nil {
		http.Error(w, `{"error": "Failed to get unread count"}`, http.StatusInternalServerError)
		return
	}

	// Kirim response dengan jumlah pesan yang belum dibaca
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int64{"count": count})
}
