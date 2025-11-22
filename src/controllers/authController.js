const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Register a new user
exports.register = async (req, res) => {
  const { username, email, phone, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    db.run(
      'INSERT INTO users (username, email, phone, password_hash) VALUES (?, ?, ?, ?)',
      [username, email, phone, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Failed to register user' });
        }

        const token = jwt.sign(
          { id: this.lastID, username, email },
          jwtSecret,
          { expiresIn: '7d' }
        );

        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: { id: this.lastID, username, email, phone }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    try {
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('JWT_SECRET is not configured');
        return res.status(500).json({ error: 'Server configuration error' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        jwtSecret,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: { id: user.id, username: user.username, email: user.email, phone: user.phone }
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
};

// Get current user profile
exports.getProfile = (req, res) => {
  db.get('SELECT id, username, email, phone, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  });
};
