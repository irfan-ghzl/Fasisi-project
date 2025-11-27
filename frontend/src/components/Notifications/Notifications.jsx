import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Notifications({ user, onLogout }) {
  const [notifications, setNotifications] = useState([]);
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
          <Link to="/chat" className="nav-item">💬 Chat</Link>
          <Link to="/notifications" className="nav-item active">🔔 Notifikasi</Link>
          <button onClick={handleLogout} className="nav-item logout-btn">🚪 Logout</button>
        </div>
      </nav>

      <div className="page-content">
        <div className="page-header">
          <h1>🔔 Notifikasi</h1>
          <button className="btn-secondary">Tandai Semua Dibaca</button>
        </div>

        {notifications.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada notifikasi</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notif, idx) => (
              <div key={idx} className="notification-item">
                <p>{notif.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
