import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Notifications({ user, onLogout }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('/api/notifications/read', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit yang lalu`;
    if (hours < 24) return `${hours} jam yang lalu`;
    if (days < 7) return `${days} hari yang lalu`;
    return date.toLocaleDateString('id-ID');
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
          {notifications.length > 0 && (
            <button className="btn-secondary" onClick={markAllAsRead}>
              Tandai Semua Dibaca
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading">Memuat notifikasi...</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada notifikasi</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`notification-item ${!notif.read_status ? 'unread' : ''}`}
              >
                <div className="notif-icon">
                  {notif.type === 'new_message' && '💬'}
                  {notif.type === 'date_request' && '🎯'}
                  {notif.type === 'gallery_upload' && '📷'}
                </div>
                <div className="notif-content">
                  <p className="notif-message">{notif.message}</p>
                  <span className="notif-time">{formatDate(notif.created_at)}</span>
                </div>
                {!notif.read_status && <div className="unread-badge"></div>}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .notification-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          position: relative;
        }

        .notification-item.unread {
          background: #fff3e0;
          border-left: 4px solid #ff6b9d;
        }

        .notification-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .notif-icon {
          font-size: 32px;
          flex-shrink: 0;
        }

        .notif-content {
          flex: 1;
        }

        .notif-message {
          margin: 0 0 4px 0;
          font-size: 15px;
          color: #333;
        }

        .notif-time {
          font-size: 13px;
          color: #666;
        }

        .unread-badge {
          width: 10px;
          height: 10px;
          background: #ff6b9d;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }
      `}</style>
    </div>
  );
}

export default Notifications;
