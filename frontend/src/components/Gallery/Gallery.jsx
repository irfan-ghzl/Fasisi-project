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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      setError('File harus berupa foto (JPEG, PNG, GIF) atau video (MP4, MOV, AVI, WebM)');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('Ukuran file maksimal 50MB');
      return;
    }

    setSelectedFile(file);
    setError('');
  };

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
          'Authorization': `Bearer ${token}`
        }
      });

      setShowUploadModal(false);
      setSelectedFile(null);
      setCaption('');
      fetchGalleries();
    } catch (error) {
      console.error('Error uploading:', error);
      setError(error.response?.data?.error || 'Gagal upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus item ini?')) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`/api/gallery/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
      <nav className="bg-white py-4 px-8 flex justify-between items-center shadow-md flex-wrap gap-4">
        <div className="text-2xl font-bold text-primary">❤️ Dating App</div>
        <div className="flex gap-4 items-center flex-wrap justify-center">
          <Link to="/dashboard" className="py-2 px-4 rounded-lg no-underline text-gray-500 transition-all duration-300 text-sm hover:bg-indigo-50 hover:text-primary">🏠 Dashboard</Link>
          <Link to="/gallery" className="py-2 px-4 rounded-lg no-underline bg-primary text-white text-sm">📷 Galeri</Link>
          <Link to="/requests" className="py-2 px-4 rounded-lg no-underline text-gray-500 transition-all duration-300 text-sm hover:bg-indigo-50 hover:text-primary">🎯 Request</Link>
          <Link to="/chat" className="py-2 px-4 rounded-lg no-underline text-gray-500 transition-all duration-300 text-sm hover:bg-indigo-50 hover:text-primary">💬 Chat</Link>
          <Link to="/notifications" className="py-2 px-4 rounded-lg no-underline text-gray-500 transition-all duration-300 text-sm hover:bg-indigo-50 hover:text-primary">🔔 Notifikasi</Link>
          <button onClick={handleLogout} className="py-2 px-4 rounded-lg bg-transparent border-none cursor-pointer text-sm text-red-500 transition-all duration-300 hover:bg-red-50 hover:text-red-700">🚪 Logout</button>
        </div>
      </nav>

      <div className="p-10 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-white text-3xl">📷 Galeri Kami</h1>
          <button 
            className="bg-primary text-white border-none py-3 px-6 rounded-lg text-base cursor-pointer transition-all duration-300 hover:bg-indigo-600 hover:-translate-y-0.5 hover:shadow-lg"
            onClick={() => setShowUploadModal(true)}
          >
            📤 Upload
          </button>
        </div>

        {loading ? (
          <p className="text-white">Loading...</p>
        ) : galleries.length === 0 ? (
          <div className="text-center py-16 px-5 text-gray-200">
            <p className="text-lg">📷 Belum ada foto atau video</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-5">
            {galleries.map(item => (
              <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-1">
                {item.file_type === 'photo' ? (
                  <img src={item.file_path} alt={item.caption} className="w-full h-52 object-cover" />
                ) : (
                  <video src={item.file_path} controls className="w-full h-52 object-cover" />
                )}
                <p className="p-4 text-gray-800">{item.caption}</p>
                {(user && (user.id === item.user_id || user.role === 'super_admin')) && (
                  <button 
                    className="mx-4 mb-4 py-2 px-4 bg-red-500 text-white border-none rounded-md cursor-pointer text-sm transition-colors duration-300 hover:bg-red-600"
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-5" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-6 text-gray-800 text-xl font-semibold">📤 Upload Foto/Video</h2>
            <form onSubmit={handleUpload}>
              <div className="mb-5">
                <label className="block mb-2 text-gray-600 font-medium">File</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,video/mp4,video/quicktime,video/x-msvideo,video/webm"
                  onChange={handleFileSelect}
                  required
                  className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-500 mt-1">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div className="mb-5">
                <label className="block mb-2 text-gray-600 font-medium">Caption</label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Tuliskan caption..."
                  required
                  className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm transition-colors duration-300 focus:outline-none focus:border-primary"
                />
              </div>

              {error && <p className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 border border-red-200">{error}</p>}

              <div className="flex gap-3 justify-end mt-6">
                <button 
                  type="button" 
                  className="bg-white text-primary border-2 border-primary py-2 px-5 rounded-lg text-sm cursor-pointer transition-all duration-300 hover:bg-primary hover:text-white disabled:opacity-50"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="bg-primary text-white border-none py-2 px-5 rounded-lg text-sm cursor-pointer transition-all duration-300 hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
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
