/**
 * Chat Component
 * 
 * Komponen React untuk fitur chat real-time antara Irfan dan Sisti
 * Menampilkan riwayat percakapan dan form untuk mengirim pesan baru
 * 
 * Features:
 * - Menampilkan riwayat chat dengan format berbeda untuk pesan dikirim/diterima
 * - Auto-refresh setiap 3 detik untuk mendapatkan pesan baru (polling)
 * - Auto-scroll ke pesan terbaru
 * - Form input untuk mengirim pesan dengan validasi
 * 
 * @param {Object} user - Object user yang sedang login (berisi id, email, role)
 * @param {Function} onLogout - Callback function untuk logout
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Chat({ user, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('/api/chat/messages', 
        { message: newMessage },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Gagal mengirim pesan: ' + (error.response?.data?.error || error.message));
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
      <nav className="bg-white py-4 px-8 flex justify-between items-center shadow-md flex-wrap gap-4">
        <div className="text-2xl font-bold text-primary">❤️ Dating App</div>
        <div className="flex gap-4 items-center flex-wrap justify-center">
          <Link to="/dashboard" className="py-2 px-4 rounded-lg no-underline text-gray-500 transition-all duration-300 text-sm hover:bg-indigo-50 hover:text-primary">🏠 Dashboard</Link>
          <Link to="/gallery" className="py-2 px-4 rounded-lg no-underline text-gray-500 transition-all duration-300 text-sm hover:bg-indigo-50 hover:text-primary">📷 Galeri</Link>
          <Link to="/requests" className="py-2 px-4 rounded-lg no-underline text-gray-500 transition-all duration-300 text-sm hover:bg-indigo-50 hover:text-primary">🎯 Request</Link>
          <Link to="/chat" className="py-2 px-4 rounded-lg no-underline bg-primary text-white text-sm">💬 Chat</Link>
          <Link to="/notifications" className="py-2 px-4 rounded-lg no-underline text-gray-500 transition-all duration-300 text-sm hover:bg-indigo-50 hover:text-primary">🔔 Notifikasi</Link>
          <button onClick={handleLogout} className="py-2 px-4 rounded-lg bg-transparent border-none cursor-pointer text-sm text-red-500 transition-all duration-300 hover:bg-red-50 hover:text-red-700">🚪 Logout</button>
        </div>
      </nav>

      <div className="p-10 max-w-6xl mx-auto">
        <h1 className="text-white text-3xl mb-6">💬 Chat</h1>
        
        <div className="bg-white rounded-2xl shadow-xl flex flex-col h-[calc(100vh-250px)]">
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
            {loading ? (
              <p className="text-gray-500">Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-400 mt-10">Belum ada pesan. Mulai chat dengan pasanganmu!</p>
            ) : (
              messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`max-w-[70%] animate-fade-in ${msg.sender_id === user?.id ? 'self-end' : 'self-start'}`}
                >
                  <div className={`py-3 px-4 rounded-2xl break-words ${
                    msg.sender_id === user?.id 
                      ? 'bg-primary text-white rounded-br-sm' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}>
                    {msg.message}
                  </div>
                  <div className={`text-xs text-gray-400 mt-1 ${msg.sender_id === user?.id ? 'text-right' : 'text-left'}`}>
                    {formatTime(msg.created_at)}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="flex gap-3 p-5 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ketik pesan..."
              disabled={sending}
              className="flex-1 py-3 px-4 border-2 border-gray-200 rounded-full text-sm transition-colors duration-300 focus:outline-none focus:border-primary disabled:bg-gray-100"
            />
            <button 
              type="submit" 
              disabled={sending || !newMessage.trim()}
              className="bg-primary text-white border-none py-3 px-6 rounded-full text-sm cursor-pointer transition-all duration-300 hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
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
