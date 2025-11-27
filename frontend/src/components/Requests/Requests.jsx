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

  const getStatusStyle = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
      <nav className="bg-white py-4 px-8 flex justify-between items-center shadow-md flex-wrap gap-4">
        <div className="text-2xl font-bold text-primary">❤️ Dating App</div>
        <div className="flex gap-4 items-center flex-wrap justify-center">
          <Link to="/dashboard" className="py-2 px-4 rounded-lg no-underline text-gray-500 transition-all duration-300 text-sm hover:bg-indigo-50 hover:text-primary">🏠 Dashboard</Link>
          <Link to="/gallery" className="py-2 px-4 rounded-lg no-underline text-gray-500 transition-all duration-300 text-sm hover:bg-indigo-50 hover:text-primary">📷 Galeri</Link>
          <Link to="/requests" className="py-2 px-4 rounded-lg no-underline bg-primary text-white text-sm">🎯 Request</Link>
          <Link to="/chat" className="py-2 px-4 rounded-lg no-underline text-gray-500 transition-all duration-300 text-sm hover:bg-indigo-50 hover:text-primary">💬 Chat</Link>
          <Link to="/notifications" className="py-2 px-4 rounded-lg no-underline text-gray-500 transition-all duration-300 text-sm hover:bg-indigo-50 hover:text-primary">🔔 Notifikasi</Link>
          <button onClick={handleLogout} className="py-2 px-4 rounded-lg bg-transparent border-none cursor-pointer text-sm text-red-500 transition-all duration-300 hover:bg-red-50 hover:text-red-700">🚪 Logout</button>
        </div>
      </nav>

      <div className="p-10 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-white text-3xl">🎯 Request Kencan</h1>
          <button 
            className="bg-primary text-white border-none py-3 px-6 rounded-lg text-base cursor-pointer transition-all duration-300 hover:bg-indigo-600 hover:-translate-y-0.5 hover:shadow-lg"
            onClick={() => setShowModal(true)}
          >
            ➕ Buat Request
          </button>
        </div>

        {loading ? (
          <p className="text-white">Loading...</p>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 px-5 text-gray-200">
            <p className="text-lg">Belum ada request kencan</p>
          </div>
        ) : (
          <div className="grid gap-5 mt-5">
            {requests.map(request => (
              <div key={request.id} className="bg-white rounded-xl p-5 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
                <div className="flex justify-between items-center mb-3">
                  <span className={`inline-block py-1.5 px-3 rounded-full text-xs font-semibold ${request.request_type === 'food' ? 'bg-yellow-100 text-yellow-800' : 'bg-cyan-100 text-cyan-800'}`}>
                    {request.request_type === 'food' ? '🍽️ Makanan' : '📍 Tempat'}
                  </span>
                  <span className={`inline-block py-1.5 px-3 rounded-full text-xs font-semibold ${getStatusStyle(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                <h3 className="text-gray-800 mb-2 text-lg font-semibold">{request.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-2">{request.description}</p>
                {request.location && <p className="text-primary font-medium">📍 {request.location}</p>}
                {user?.role === 'super_admin' && (
                  <button 
                    onClick={() => handleDelete(request.id)} 
                    className="mt-3 py-2 px-4 bg-red-500 text-white border-none rounded-md cursor-pointer text-sm transition-colors duration-300 hover:bg-red-600"
                  >
                    Hapus
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-5" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-6 text-gray-800 text-xl font-semibold">Buat Request Baru</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block mb-2 text-gray-600 font-medium">Tipe Request</label>
                <select 
                  value={formData.request_type}
                  onChange={(e) => setFormData({...formData, request_type: e.target.value})}
                  required
                  className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm transition-colors duration-300 focus:outline-none focus:border-primary"
                >
                  <option value="food">🍽️ Makanan</option>
                  <option value="place">📍 Tempat</option>
                </select>
              </div>
              
              <div className="mb-5">
                <label className="block mb-2 text-gray-600 font-medium">Judul</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Contoh: Makan di Restoran Italia"
                  required
                  className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm transition-colors duration-300 focus:outline-none focus:border-primary"
                />
              </div>
              
              <div className="mb-5">
                <label className="block mb-2 text-gray-600 font-medium">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Ceritakan lebih detail..."
                  rows="3"
                  required
                  className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm transition-colors duration-300 focus:outline-none focus:border-primary resize-y"
                />
              </div>
              
              <div className="mb-5">
                <label className="block mb-2 text-gray-600 font-medium">Lokasi</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Contoh: Restoran Bella Italia, Jl. Sudirman"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm transition-colors duration-300 focus:outline-none focus:border-primary"
                />
              </div>
              
              <div className="flex gap-3 justify-end mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="bg-white text-primary border-2 border-primary py-2 px-5 rounded-lg text-sm cursor-pointer transition-all duration-300 hover:bg-primary hover:text-white"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-primary text-white border-none py-2 px-5 rounded-lg text-sm cursor-pointer transition-all duration-300 hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
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
