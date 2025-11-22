const db = require('../config/database');
const path = require('path');
const fs = require('fs');

// Get all gallery items
exports.getGallery = (req, res) => {
  db.all(
    `SELECT g.*, u.username 
     FROM gallery g 
     JOIN users u ON g.user_id = u.id 
     ORDER BY g.created_at DESC`,
    [],
    (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch gallery' });
      }
      res.json(items);
    }
  );
};

// Upload new media to gallery
exports.uploadMedia = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { caption } = req.body;
  const fileType = req.file.mimetype.startsWith('video/') ? 'video' : 'photo';
  const filePath = `/uploads/${fileType}s/${req.file.filename}`;

  db.run(
    'INSERT INTO gallery (user_id, file_type, file_path, caption) VALUES (?, ?, ?, ?)',
    [req.user.id, fileType, filePath, caption || null],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to save media' });
      }

      res.status(201).json({
        message: 'Media uploaded successfully',
        item: {
          id: this.lastID,
          user_id: req.user.id,
          file_type: fileType,
          file_path: filePath,
          caption
        }
      });
    }
  );
};

// Delete gallery item
exports.deleteMedia = (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM gallery WHERE id = ?', [id], (err, item) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Only allow user to delete their own items
    if (item.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    db.run('DELETE FROM gallery WHERE id = ?', [id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete item' });
      }

      // Delete the actual file
      const filePath = path.join(__dirname, '../../public', item.file_path);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });

      res.json({ message: 'Item deleted successfully' });
    });
  });
};
