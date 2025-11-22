import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Gallery.css';

function Gallery({ user, onLogout }) {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/gallery', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGalleries(response.data || []);
    } catch (error) {
      console.error('Error fetching galleries:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <Link to="/gallery" className="nav-item active">📷 Galeri</Link>
          <Link to="/requests" className="nav-item">🎯 Request</Link>
          <Link to="/chat" className="nav-item">💬 Chat</Link>
          <Link to="/notifications" className="nav-item">🔔 Notifikasi</Link>
          <button onClick={handleLogout} className="nav-item logout-btn">🚪 Logout</button>
        </div>
      </nav>

      <div className="page-content">
        <div className="page-header">
          <h1>📷 Galeri Kami</h1>
          <button className="btn-primary">📤 Upload</button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : galleries.length === 0 ? (
          <div className="empty-state">
            <p>📷 Belum ada foto atau video</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {galleries.map(item => (
              <div key={item.id} className="gallery-item">
                <img src={item.file_path} alt={item.caption} />
                <p>{item.caption}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Gallery;
