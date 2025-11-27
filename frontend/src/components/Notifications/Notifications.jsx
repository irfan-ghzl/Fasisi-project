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
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
      <nav className="bg-white py-4 px-8 flex justify-between items-center shadow-md flex-wrap gap-4">
        <div className="text-2xl font-bold text-primary">❤️ Dating App</div>
        <div className="flex gap-4 items-center flex-wrap justify-center">
          <Link to="/dashboard" className="py-2 px-4 rounded-lg no-underline text-gray-500 transition-all duration-300 text-sm hover:bg-indigo-50 hover:text-primary">🏠 Dashboard</Link>
          <Link to="/gallery" className="py-2 px-4 rounded-lg no-underline text-gray-500 transition-all duration-300 text-sm hover:bg-indigo-50 hover:text-primary">📷 Galeri</Link>
          <Link to="/requests" className="py-2 px-4 rounded-lg no-underline text-gray-500 transition-all duration-300 text-sm hover:bg-indigo-50 hover:text-primary">🎯 Request</Link>
          <Link to="/chat" className="py-2 px-4 rounded-lg no-underline text-gray-500 transition-all duration-300 text-sm hover:bg-indigo-50 hover:text-primary">💬 Chat</Link>
          <Link to="/notifications" className="py-2 px-4 rounded-lg no-underline bg-primary text-white text-sm">🔔 Notifikasi</Link>
          <button onClick={handleLogout} className="py-2 px-4 rounded-lg bg-transparent border-none cursor-pointer text-sm text-red-500 transition-all duration-300 hover:bg-red-50 hover:text-red-700">🚪 Logout</button>
        </div>
      </nav>

      <div className="p-10 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-white text-3xl">🔔 Notifikasi</h1>
          {notifications.length > 0 && (
            <button 
              className="bg-white text-primary border-2 border-primary py-2 px-5 rounded-lg text-sm cursor-pointer transition-all duration-300 hover:bg-primary hover:text-white"
              onClick={markAllAsRead}
            >
              Tandai Semua Dibaca
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-200">Memuat notifikasi...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 px-5 text-gray-200">
            <p className="text-lg">Belum ada notifikasi</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`flex items-center gap-4 p-4 bg-white rounded-xl shadow-lg transition-all duration-300 relative hover:-translate-y-0.5 hover:shadow-xl ${!notif.read_status ? 'bg-orange-50 border-l-4 border-pink-400' : ''}`}
              >
                <div className="text-3xl flex-shrink-0">
                  {notif.type === 'new_message' && '💬'}
                  {notif.type === 'date_request' && '🎯'}
                  {notif.type === 'gallery_upload' && '📷'}
                </div>
                <div className="flex-1">
                  <p className="m-0 mb-1 text-sm text-gray-800">{notif.message}</p>
                  <span className="text-xs text-gray-500">{formatDate(notif.created_at)}</span>
                </div>
                {!notif.read_status && <div className="w-2.5 h-2.5 bg-pink-400 rounded-full flex-shrink-0"></div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
