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
    // Poll for new messages every 3 seconds
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
    <div className="page-container">
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

      <div className="page-content">
        <h1>💬 Chat</h1>
        <div className="chat-container">
          <div className="chat-messages">
            {loading ? (
              <p>Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="empty-chat">Belum ada pesan. Mulai chat dengan pasanganmu!</p>
            ) : (
              messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`message ${msg.sender_id === user?.id ? 'sent' : 'received'}`}
                >
                  <div className="message-content">
                    {msg.message}
                  </div>
                  <div className="message-time">
                    {formatTime(msg.created_at)}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ketik pesan..."
              disabled={sending}
            />
            <button type="submit" className="btn-primary" disabled={sending || !newMessage.trim()}>
              {sending ? 'Mengirim...' : 'Kirim'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;
