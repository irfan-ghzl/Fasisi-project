import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Requests({ user, onLogout }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    request_type: 'food',
    title: '',
    description: '',
    location: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('/api/requests', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      alert('Request berhasil dibuat!');
      setShowModal(false);
      setFormData({
        request_type: 'food',
        title: '',
        description: '',
        location: ''
      });
      fetchRequests();
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Gagal membuat request: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus request ini?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`/api/requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Request berhasil dihapus!');
      fetchRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Gagal menghapus request');
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
          <Link to="/gallery" className="nav-item">📷 Galeri</Link>
          <Link to="/requests" className="nav-item active">🎯 Request</Link>
          <Link to="/chat" className="nav-item">💬 Chat</Link>
          <Link to="/notifications" className="nav-item">🔔 Notifikasi</Link>
          <button onClick={handleLogout} className="nav-item logout-btn">🚪 Logout</button>
        </div>
      </nav>

      <div className="page-content">
        <div className="page-header">
          <h1>🎯 Request Kencan</h1>
          <button className="btn-primary" onClick={() => setShowModal(true)}>➕ Buat Request</button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada request kencan</p>
          </div>
        ) : (
          <div className="requests-list">
            {requests.map(request => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <span className={`badge ${request.request_type}`}>
                    {request.request_type === 'food' ? '🍽️ Makanan' : '📍 Tempat'}
                  </span>
                  <span className={`status ${request.status}`}>{request.status}</span>
                </div>
                <h3>{request.title}</h3>
                <p>{request.description}</p>
                {request.location && <p className="location">📍 {request.location}</p>}
                {user?.role === 'super_admin' && (
                  <button onClick={() => handleDelete(request.id)} className="btn-delete">Hapus</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Buat Request Baru</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tipe Request</label>
                <select 
                  value={formData.request_type}
                  onChange={(e) => setFormData({...formData, request_type: e.target.value})}
                  required
                >
                  <option value="food">🍽️ Makanan</option>
                  <option value="place">📍 Tempat</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Judul</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Contoh: Makan di Restoran Italia"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Ceritakan lebih detail..."
                  rows="3"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Lokasi</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Contoh: Restoran Bella Italia, Jl. Sudirman"
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Mengirim...' : 'Kirim Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Requests;
