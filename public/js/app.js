// API Base URL
const API_BASE = '/api';

// State
let currentUser = null;
let authToken = null;
let socket = null;
let partnerId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupAuthListeners();
  setupAppListeners();
});

// Check authentication
function checkAuth() {
  authToken = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('currentUser');
  
  if (authToken && userStr) {
    currentUser = JSON.parse(userStr);
    showApp();
    initializeSocket();
  } else {
    showAuth();
  }
}

// Show auth section
function showAuth() {
  document.getElementById('auth-section').classList.add('active');
  document.getElementById('app-section').classList.remove('active');
}

// Show app section
function showApp() {
  document.getElementById('auth-section').classList.remove('active');
  document.getElementById('app-section').classList.add('active');
  loadGallery();
  loadNotificationCount();
  loadChatUnreadCount();
}

// Setup auth listeners
function setupAuthListeners() {
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`${tab}-form`).classList.add('active');
    });
  });

  // Login form
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        alert('Login berhasil!');
        showApp();
        initializeSocket();
      } else {
        alert(data.error || 'Login gagal');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Terjadi kesalahan saat login');
    }
  });

  // Register form
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, phone, password })
      });

      const data = await response.json();

      if (response.ok) {
        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        alert('Registrasi berhasil!');
        showApp();
        initializeSocket();
      } else {
        alert(data.error || 'Registrasi gagal');
      }
    } catch (error) {
      console.error('Register error:', error);
      alert('Terjadi kesalahan saat registrasi');
    }
  });
}

// Setup app listeners
function setupAppListeners() {
  // Navigation
  document.querySelectorAll('.nav-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`${page}-page`).classList.add('active');

      // Load page data
      if (page === 'gallery') loadGallery();
      else if (page === 'requests') loadRequests();
      else if (page === 'chat') loadChat();
      else if (page === 'notifications') loadNotifications();
    });
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('Yakin ingin logout?')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      authToken = null;
      currentUser = null;
      if (socket) socket.disconnect();
      showAuth();
    }
  });

  // Gallery upload
  document.getElementById('upload-btn').addEventListener('click', () => {
    document.getElementById('upload-form').style.display = 'block';
  });

  document.getElementById('cancel-upload').addEventListener('click', () => {
    document.getElementById('upload-form').style.display = 'none';
    document.getElementById('galleryUploadForm').reset();
  });

  document.getElementById('galleryUploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const fileInput = document.getElementById('file-upload');
    const caption = document.getElementById('file-caption').value;

    formData.append('file', fileInput.files[0]);
    if (caption) formData.append('caption', caption);

    try {
      const response = await fetch(`${API_BASE}/gallery/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        alert('Upload berhasil!');
        document.getElementById('upload-form').style.display = 'none';
        document.getElementById('galleryUploadForm').reset();
        loadGallery();
      } else {
        alert(data.error || 'Upload gagal');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Terjadi kesalahan saat upload');
    }
  });

  // Request form
  document.getElementById('new-request-btn').addEventListener('click', () => {
    document.getElementById('request-form').style.display = 'block';
  });

  document.getElementById('cancel-request').addEventListener('click', () => {
    document.getElementById('request-form').style.display = 'none';
    document.getElementById('requestForm').reset();
  });

  document.getElementById('requestForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const requestType = document.getElementById('request-type').value;
    const title = document.getElementById('request-title').value;
    const description = document.getElementById('request-description').value;
    const location = document.getElementById('request-location').value;

    try {
      const response = await fetch(`${API_BASE}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          request_type: requestType,
          title,
          description,
          location
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Request berhasil dibuat!');
        document.getElementById('request-form').style.display = 'none';
        document.getElementById('requestForm').reset();
        loadRequests();
      } else {
        alert(data.error || 'Gagal membuat request');
      }
    } catch (error) {
      console.error('Request error:', error);
      alert('Terjadi kesalahan saat membuat request');
    }
  });

  // Chat form
  document.getElementById('chatForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = document.getElementById('chat-message').value;

    if (!partnerId) {
      alert('Partner tidak ditemukan');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          receiverId: partnerId,
          message
        })
      });

      const data = await response.json();

      if (response.ok) {
        document.getElementById('chat-message').value = '';
        
        // Send via socket
        if (socket) {
          socket.emit('sendMessage', {
            senderId: currentUser.id,
            receiverId: partnerId,
            message
          });
        }
        
        loadChat();
      } else {
        alert(data.error || 'Gagal mengirim pesan');
      }
    } catch (error) {
      console.error('Chat error:', error);
      alert('Terjadi kesalahan saat mengirim pesan');
    }
  });

  // Mark all notifications as read
  document.getElementById('mark-all-read-btn').addEventListener('click', async () => {
    try {
      const response = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.ok) {
        loadNotifications();
        loadNotificationCount();
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  });
}

// Initialize Socket.io
function initializeSocket() {
  socket = io();
  
  socket.on('connect', () => {
    console.log('Connected to socket server');
    socket.emit('register', currentUser.id);
  });

  socket.on('receiveMessage', (data) => {
    console.log('New message received:', data);
    loadChat();
    loadChatUnreadCount();
  });

  socket.on('userTyping', (data) => {
    console.log('User typing:', data);
  });
}

// Load gallery
async function loadGallery() {
  try {
    const response = await fetch(`${API_BASE}/gallery`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const items = await response.json();
    const grid = document.getElementById('gallery-grid');

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📷</div>
          <div class="empty-state-text">Belum ada foto atau video</div>
        </div>
      `;
      return;
    }

    grid.innerHTML = items.map(item => `
      <div class="gallery-item">
        ${item.file_type === 'video' 
          ? `<video src="${item.file_path}" controls></video>`
          : `<img src="${item.file_path}" alt="${item.caption || ''}">`
        }
        <div class="gallery-item-info">
          ${item.caption ? `<div class="gallery-item-caption">${item.caption}</div>` : ''}
          <div class="gallery-item-meta">
            <span>oleh ${item.username}</span>
            <div class="gallery-item-actions">
              ${item.user_id === currentUser.id 
                ? `<button class="btn-delete" onclick="deleteGalleryItem(${item.id})">Hapus</button>`
                : ''
              }
            </div>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading gallery:', error);
  }
}

// Delete gallery item
async function deleteGalleryItem(id) {
  if (!confirm('Yakin ingin menghapus item ini?')) return;

  try {
    const response = await fetch(`${API_BASE}/gallery/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (response.ok) {
      alert('Item berhasil dihapus');
      loadGallery();
    } else {
      const data = await response.json();
      alert(data.error || 'Gagal menghapus item');
    }
  } catch (error) {
    console.error('Delete error:', error);
    alert('Terjadi kesalahan saat menghapus');
  }
}

// Load requests
async function loadRequests() {
  try {
    const response = await fetch(`${API_BASE}/requests`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const requests = await response.json();
    const list = document.getElementById('requests-list');

    if (requests.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🎯</div>
          <div class="empty-state-text">Belum ada request</div>
        </div>
      `;
      return;
    }

    list.innerHTML = requests.map(req => `
      <div class="request-item">
        <div class="request-header">
          <span class="request-type ${req.request_type}">${req.request_type === 'place' ? '📍 Tempat' : '🍽️ Makanan'}</span>
          <span class="request-status ${req.status}">${getStatusText(req.status)}</span>
        </div>
        <div class="request-title">${req.title}</div>
        ${req.description ? `<div class="request-description">${req.description}</div>` : ''}
        ${req.location ? `<div class="request-location">📍 ${req.location}</div>` : ''}
        <div class="request-meta">
          <span>oleh ${req.username}</span>
          <div class="request-actions">
            ${req.user_id !== currentUser.id && req.status === 'pending'
              ? `
                <button class="btn-approve" onclick="updateRequestStatus(${req.id}, 'approved')">✓ Setuju</button>
                <button class="btn-reject" onclick="updateRequestStatus(${req.id}, 'rejected')">✗ Tolak</button>
              `
              : ''
            }
            ${req.user_id === currentUser.id
              ? `<button class="btn-delete" onclick="deleteRequest(${req.id})">Hapus</button>`
              : ''
            }
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading requests:', error);
  }
}

function getStatusText(status) {
  const statusMap = {
    'pending': 'Menunggu',
    'approved': 'Disetujui',
    'rejected': 'Ditolak'
  };
  return statusMap[status] || status;
}

// Update request status
async function updateRequestStatus(id, status) {
  try {
    const response = await fetch(`${API_BASE}/requests/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ status })
    });

    if (response.ok) {
      alert('Status berhasil diupdate');
      loadRequests();
    } else {
      const data = await response.json();
      alert(data.error || 'Gagal update status');
    }
  } catch (error) {
    console.error('Update status error:', error);
    alert('Terjadi kesalahan saat update status');
  }
}

// Delete request
async function deleteRequest(id) {
  if (!confirm('Yakin ingin menghapus request ini?')) return;

  try {
    const response = await fetch(`${API_BASE}/requests/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (response.ok) {
      alert('Request berhasil dihapus');
      loadRequests();
    } else {
      const data = await response.json();
      alert(data.error || 'Gagal menghapus request');
    }
  } catch (error) {
    console.error('Delete error:', error);
    alert('Terjadi kesalahan saat menghapus');
  }
}

// Load chat
async function loadChat() {
  try {
    // Get partner (the other user)
    const usersResponse = await fetch(`${API_BASE}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!usersResponse.ok) return;

    // For this app, we'll get partner by finding any user that's not current user
    // In a real app, you'd have a proper user selection mechanism
    if (!partnerId) {
      // This is a simplification - in production you'd have proper partner selection
      // For now, we'll use a fixed approach where partner is whoever is not current user
      partnerId = currentUser.id === 1 ? 2 : 1;
    }

    const response = await fetch(`${API_BASE}/chat/history/${partnerId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const messages = await response.json();
    const container = document.getElementById('messages-container');

    if (messages.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">💬</div>
          <div class="empty-state-text">Belum ada pesan</div>
        </div>
      `;
      return;
    }

    container.innerHTML = messages.map(msg => {
      const isSent = msg.sender_id === currentUser.id;
      const time = new Date(msg.created_at).toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      return `
        <div class="message ${isSent ? 'sent' : 'received'}">
          <div class="message-bubble">${msg.message}</div>
          <div class="message-time">${time}</div>
        </div>
      `;
    }).join('');

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;

    // Mark messages as read
    await fetch(`${API_BASE}/chat/read/${partnerId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    loadChatUnreadCount();
  } catch (error) {
    console.error('Error loading chat:', error);
  }
}

// Load chat unread count
async function loadChatUnreadCount() {
  try {
    const response = await fetch(`${API_BASE}/chat/unread-count`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    const badge = document.getElementById('chat-badge');

    if (data.unreadCount > 0) {
      badge.textContent = data.unreadCount;
      badge.classList.add('show');
    } else {
      badge.classList.remove('show');
    }
  } catch (error) {
    console.error('Error loading chat unread count:', error);
  }
}

// Load notifications
async function loadNotifications() {
  try {
    const response = await fetch(`${API_BASE}/notifications`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const notifications = await response.json();
    const list = document.getElementById('notifications-list');

    if (notifications.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔔</div>
          <div class="empty-state-text">Belum ada notifikasi</div>
        </div>
      `;
      return;
    }

    list.innerHTML = notifications.map(notif => {
      const time = new Date(notif.created_at).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <div class="notification-item ${notif.read_status ? '' : 'unread'}">
          <div class="notification-content">
            <div class="notification-message">${notif.message}</div>
            <div class="notification-time">${time}</div>
          </div>
          ${!notif.read_status 
            ? `<div class="notification-actions">
                <button onclick="markNotificationAsRead(${notif.id})">Tandai Dibaca</button>
              </div>`
            : ''
          }
        </div>
      `;
    }).join('');

    loadNotificationCount();
  } catch (error) {
    console.error('Error loading notifications:', error);
  }
}

// Mark notification as read
async function markNotificationAsRead(id) {
  try {
    const response = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (response.ok) {
      loadNotifications();
      loadNotificationCount();
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

// Load notification count
async function loadNotificationCount() {
  try {
    const response = await fetch(`${API_BASE}/notifications/unread-count`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    const badge = document.getElementById('notif-badge');

    if (data.unreadCount > 0) {
      badge.textContent = data.unreadCount;
      badge.classList.add('show');
    } else {
      badge.classList.remove('show');
    }
  } catch (error) {
    console.error('Error loading notification count:', error);
  }
}

// Make functions globally available
window.deleteGalleryItem = deleteGalleryItem;
window.updateRequestStatus = updateRequestStatus;
window.deleteRequest = deleteRequest;
window.markNotificationAsRead = markNotificationAsRead;
