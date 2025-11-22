/**
 * Gallery Component
 * 
 * Komponen React untuk fitur gallery - upload dan tampilkan foto/video
 * User dapat upload media (foto atau video) dengan caption
 * 
 * Features:
 * - Upload foto dan video (JPEG, PNG, GIF, MP4, MOV, AVI, WebM)
 * - Menampilkan semua gallery items dalam grid layout
 * - Delete functionality (user dapat hapus item sendiri, admin dapat hapus semua)
 * - File validation (max 50MB)
 * - Loading dan error states
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Gallery.css';

function Gallery({ user, onLogout }) {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGalleries();
  }, []);

  /**
   * fetchGalleries - Mengambil semua gallery items dari backend
   * GET /api/gallery
   */
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

  /**
   * handleFileSelect - Handler ketika user memilih file
   * Validasi:
   * - File type: image/* atau video/*
   * - File size: max 50MB
   */
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      setError('File harus berupa foto (JPEG, PNG, GIF) atau video (MP4, MOV, AVI, WebM)');
      return;
    }

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('Ukuran file maksimal 50MB');
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  /**
   * handleUpload - Submit form untuk upload file ke backend
   * POST /api/gallery/upload
   * 
   * Menggunakan FormData untuk mengirim file dan caption
   * Setelah sukses, refresh gallery list dan tutup modal
   */
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Pilih file terlebih dahulu');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('caption', caption);

      await axios.post('/api/gallery/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Reset form dan tutup modal
      setShowUploadModal(false);
      setSelectedFile(null);
      setCaption('');
      
      // Refresh gallery
      fetchGalleries();
    } catch (error) {
      console.error('Error uploading:', error);
      setError(error.response?.data?.error || 'Gagal upload file');
    } finally {
      setUploading(false);
    }
  };

  /**
   * handleDelete - Hapus gallery item
   * DELETE /api/gallery/{id}
   * 
   * User biasa hanya bisa hapus item milik sendiri
   * Super admin bisa hapus semua item
   */
  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus item ini?')) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`/api/gallery/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh gallery setelah delete
      fetchGalleries();
    } catch (error) {
      console.error('Error deleting:', error);
      alert(error.response?.data?.error || 'Gagal menghapus item');
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
          <button className="btn-primary" onClick={() => setShowUploadModal(true)}>
            📤 Upload
          </button>
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
                {item.file_type === 'photo' ? (
                  <img src={item.file_path} alt={item.caption} />
                ) : (
                  <video src={item.file_path} controls />
                )}
                <p>{item.caption}</p>
                {(user && (user.id === item.user_id || user.role === 'super_admin')) && (
                  <button 
                    className="btn-delete" 
                    onClick={() => handleDelete(item.id)}
                  >
                    🗑️ Hapus
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>📤 Upload Foto/Video</h2>
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label>File</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,video/mp4,video/quicktime,video/x-msvideo,video/webm"
                  onChange={handleFileSelect}
                  required
                />
                {selectedFile && (
                  <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>Caption</label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Tuliskan caption..."
                  required
                />
              </div>

              {error && <p className="error-message">{error}</p>}

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;
