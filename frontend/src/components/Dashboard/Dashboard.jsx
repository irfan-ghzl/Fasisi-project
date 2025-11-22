import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="nav-brand">❤️ Dating App</div>
        <div className="nav-menu">
          <Link to="/gallery" className="nav-item">📷 Galeri</Link>
          <Link to="/requests" className="nav-item">🎯 Request</Link>
          <Link to="/chat" className="nav-item">💬 Chat</Link>
          <Link to="/notifications" className="nav-item">🔔 Notifikasi</Link>
          <button onClick={handleLogout} className="nav-item logout-btn">🚪 Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <h1>Selamat Datang, {user?.username}! 💖</h1>
        <p className="user-role">
          {user?.role === 'super_admin' ? '👑 Super Admin' : '👤 User'}
        </p>

        <div className="dashboard-grid">
          <Link to="/gallery" className="dashboard-card">
            <div className="card-icon">📷</div>
            <h3>Galeri</h3>
            <p>Lihat foto dan video kenangan kita</p>
          </Link>

          <Link to="/requests" className="dashboard-card">
            <div className="card-icon">🎯</div>
            <h3>Request Kencan</h3>
            <p>Buat request tempat jalan atau makan</p>
          </Link>

          <Link to="/chat" className="dashboard-card">
            <div className="card-icon">💬</div>
            <h3>Chat</h3>
            <p>Chat real-time dengan pasangan</p>
          </Link>

          <Link to="/notifications" className="dashboard-card">
            <div className="card-icon">🔔</div>
            <h3>Notifikasi</h3>
            <p>Lihat semua notifikasi</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
