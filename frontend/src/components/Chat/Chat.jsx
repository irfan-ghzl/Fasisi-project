import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Chat({ user, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
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
            {messages.length === 0 ? (
              <p>Belum ada pesan</p>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className="message">{msg.text}</div>
              ))
            )}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ketik pesan..."
            />
            <button className="btn-primary">Kirim</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
