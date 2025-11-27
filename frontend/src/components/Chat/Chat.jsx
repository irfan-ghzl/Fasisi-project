/**
 * Chat Component
 * 
 * Komponen React untuk fitur chat real-time antara Irfan dan Sisti
 * Menampilkan riwayat percakapan dan form untuk mengirim pesan baru
 * 
 * Features:
 * - Menampilkan riwayat chat dengan format yang berbeda untuk pesan yang dikirim vs diterima
 * - Auto-refresh setiap 3 detik untuk mendapatkan pesan baru (polling)
 * - Auto-scroll ke pesan terbaru ketika ada pesan baru
 * - Form input untuk mengirim pesan dengan validasi
 * - Loading state dan error handling
 * 
 * Props:
 * @param {Object} user - Object user yang sedang login (berisi id, email, role)
 * @param {Function} onLogout - Callback function untuk logout
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Chat({ user, onLogout }) {
  // State management
  const [messages, setMessages] = useState([]);        // Array semua pesan chat
  const [newMessage, setNewMessage] = useState('');    // Input pesan baru
  const [loading, setLoading] = useState(true);        // Loading state saat fetch data
  const [sending, setSending] = useState(false);       // Loading state saat kirim pesan
  
  // Ref untuk auto-scroll ke pesan terbaru
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  /**
   * Effect: Fetch messages dan setup polling
   * 
   * Dijalankan saat component pertama kali di-mount
   * - Memanggil fetchMessages() untuk load pesan awal
   * - Setup interval untuk auto-refresh setiap 3 detik
   * - Cleanup interval ketika component unmount
   */
  useEffect(() => {
    fetchMessages();
    // Poll untuk pesan baru setiap 3 detik
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Effect: Auto-scroll ke pesan terbaru
   * 
   * Dijalankan setiap kali array messages berubah
   * Membuat halaman scroll otomatis ke bawah untuk menampilkan pesan terbaru
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Scroll halaman ke pesan paling bawah (terbaru)
   * Menggunakan smooth scrolling untuk animasi yang halus
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Fetch semua pesan chat dari backend
   * 
   * Endpoint: GET /api/chat/messages
   * Headers: Authorization Bearer token
   * 
   * Response: Array of messages
   * [
   *   {
   *     id: 1,
   *     sender_id: 1,
   *     receiver_id: 2,
   *     message: "Halo sayang",
   *     created_at: "2025-11-22T10:30:00Z",
   *     read_status: true
   *   },
   *   ...
   * ]
   */
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/chat/messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle submit form untuk mengirim pesan baru
   * 
   * Flow:
   * 1. Validasi pesan tidak boleh kosong
   * 2. Set state sending = true untuk disable button
   * 3. Kirim POST request ke backend
   * 4. Clear input field jika berhasil
   * 5. Refresh pesan untuk menampilkan pesan yang baru dikirim
   * 
   * @param {Event} e - Form submit event
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // Validasi: pesan tidak boleh kosong atau hanya spasi
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const token = localStorage.getItem('authToken');
      
      // POST request ke backend
      await axios.post('/api/chat/messages', 
        { message: newMessage },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Clear input dan refresh pesan
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Gagal mengirim pesan: ' + (error.response?.data?.error || error.message));
    } finally {
      setSending(false);
    }
  };

  /**
   * Handle logout
   * Memanggil callback onLogout dan redirect ke halaman login
   */
  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  /**
   * Format timestamp menjadi format jam:menit (HH:MM)
   * 
   * @param {string} timestamp - ISO timestamp dari backend
   * @returns {string} Format waktu "10:30"
   */
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  /**
   * Render UI Component
   * 
   * Layout:
   * 1. Navigation bar - dengan menu untuk semua fitur
   * 2. Chat container - area untuk menampilkan pesan
   * 3. Chat messages - list pesan dengan styling berbeda untuk sent/received
   * 4. Chat input - form untuk mengirim pesan baru
   * 
   * Styling:
   * - Pesan yang dikirim (sender_id === user.id): Tampil di kanan dengan background biru
   * - Pesan yang diterima (sender_id !== user.id): Tampil di kiri dengan background abu-abu
   * - Setiap pesan menampilkan isi pesan dan timestamp
   */
  return (
    <div className="page-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-brand">❤️ Dating App</div>
        <div className="nav-menu">
          <Link to="/dashboard" className="nav-item">🏠 Dashboard</Link>
          <Link to="/gallery" className="nav-item">📷 Galeri</Link>
          <Link to="/requests" className="nav-item">🎯 Request</Link>
          <Link to="/chat" className="nav-item active">💬 Chat</Link>
          <Link to="/notifications" className="nav-item">🔔 Notifikasi</Link>
          <button onClick={handleLogout} className="nav-item logout-btn">🚪 Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="page-content">
        <h1>💬 Chat</h1>
        
        {/* Chat Container */}
        <div className="chat-container">
          {/* Messages Area */}
          <div className="chat-messages">
            {/* Loading state */}
            {loading ? (
              <p>Loading messages...</p>
            ) : messages.length === 0 ? (
              /* Empty state - belum ada pesan */
              <p className="empty-chat">Belum ada pesan. Mulai chat dengan pasanganmu!</p>
            ) : (
              /* List messages - loop semua pesan */
              messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`message ${msg.sender_id === user?.id ? 'sent' : 'received'}`}
                >
                  {/* Isi pesan */}
                  <div className="message-content">
                    {msg.message}
                  </div>
                  {/* Timestamp */}
                  <div className="message-time">
                    {formatTime(msg.created_at)}
                  </div>
                </div>
              ))
            )}
            {/* Invisible div untuk scroll target */}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Form untuk mengirim pesan baru */}
          <form onSubmit={handleSendMessage} className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ketik pesan..."
              disabled={sending}
            />
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={sending || !newMessage.trim()}
            >
              {sending ? 'Mengirim...' : 'Kirim'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;
