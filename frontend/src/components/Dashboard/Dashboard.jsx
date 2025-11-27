import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
      <nav className="bg-white py-4 px-8 flex justify-between items-center shadow-md">
        <div className="text-2xl font-bold text-primary">❤️ Dating App</div>
        <div className="flex gap-4 items-center">
          <Link to="/gallery" className="py-2 px-4 rounded-lg no-underline text-gray-500 transition-all duration-300 text-sm hover:bg-indigo-50 hover:text-primary">📷 Galeri</Link>
          <Link to="/requests" className="py-2 px-4 rounded-lg no-underline text-gray-500 transition-all duration-300 text-sm hover:bg-indigo-50 hover:text-primary">🎯 Request</Link>
          <Link to="/chat" className="py-2 px-4 rounded-lg no-underline text-gray-500 transition-all duration-300 text-sm hover:bg-indigo-50 hover:text-primary">💬 Chat</Link>
          <Link to="/notifications" className="py-2 px-4 rounded-lg no-underline text-gray-500 transition-all duration-300 text-sm hover:bg-indigo-50 hover:text-primary">🔔 Notifikasi</Link>
          <button onClick={handleLogout} className="py-2 px-4 rounded-lg bg-transparent border-none cursor-pointer text-sm text-red-500 transition-all duration-300 hover:bg-red-50 hover:text-red-700">🚪 Logout</button>
        </div>
      </nav>

      <div className="p-10 max-w-6xl mx-auto">
        <h1 className="text-white text-4xl mb-2 text-center">Selamat Datang, {user?.username}! 💖</h1>
        <p className="text-white/90 text-center mb-10 text-lg">
          {user?.role === 'super_admin' ? '👑 Super Admin' : '👤 User'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          <Link to="/gallery" className="bg-white rounded-2xl p-8 text-center no-underline text-inherit transition-all duration-300 shadow-lg hover:-translate-y-2 hover:shadow-xl">
            <div className="text-5xl mb-4">📷</div>
            <h3 className="text-primary mb-2 text-xl font-semibold">Galeri</h3>
            <p className="text-gray-500 text-sm">Lihat foto dan video kenangan kita</p>
          </Link>

          <Link to="/requests" className="bg-white rounded-2xl p-8 text-center no-underline text-inherit transition-all duration-300 shadow-lg hover:-translate-y-2 hover:shadow-xl">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-primary mb-2 text-xl font-semibold">Request Kencan</h3>
            <p className="text-gray-500 text-sm">Buat request tempat jalan atau makan</p>
          </Link>

          <Link to="/chat" className="bg-white rounded-2xl p-8 text-center no-underline text-inherit transition-all duration-300 shadow-lg hover:-translate-y-2 hover:shadow-xl">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-primary mb-2 text-xl font-semibold">Chat</h3>
            <p className="text-gray-500 text-sm">Chat real-time dengan pasangan</p>
          </Link>

          <Link to="/notifications" className="bg-white rounded-2xl p-8 text-center no-underline text-inherit transition-all duration-300 shadow-lg hover:-translate-y-2 hover:shadow-xl">
            <div className="text-5xl mb-4">🔔</div>
            <h3 className="text-primary mb-2 text-xl font-semibold">Notifikasi</h3>
            <p className="text-gray-500 text-sm">Lihat semua notifikasi</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
