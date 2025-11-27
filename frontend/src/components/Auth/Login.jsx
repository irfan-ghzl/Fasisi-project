import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      // Store both access token and refresh token
      localStorage.setItem('refreshToken', response.data.refresh_token);
      onLogin(response.data.token, response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-5 bg-gradient-to-br from-primary to-secondary">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl text-primary mb-2">❤️ Fasisi App</h1>
          <p className="text-gray-500 text-sm">Platform Khusus untuk Kami Berdua</p>
        </div>

        <div className="flex gap-3 mb-8">
          <button className="flex-1 py-3 px-4 border-2 border-primary bg-primary text-white rounded-lg text-base cursor-pointer transition-all duration-300 text-center">
            Login
          </button>
          <Link to="/register" className="flex-1 py-3 px-4 border-2 border-primary bg-white text-primary rounded-lg text-base cursor-pointer transition-all duration-300 text-center no-underline hover:bg-indigo-50">
            Register
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <h2 className="mb-5 text-gray-800 text-xl font-semibold">Login</h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 border border-red-200">
              {error}
            </div>
          )}

          <div className="mb-5">
            <label className="block mb-2 text-gray-700 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm transition-colors duration-300 focus:outline-none focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="mb-5">
            <label className="block mb-2 text-gray-700 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm transition-colors duration-300 focus:outline-none focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 bg-primary text-white border-none py-3 px-6 rounded-lg text-base cursor-pointer transition-all duration-300 hover:bg-indigo-600 hover:-translate-y-0.5 hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
