const db = require('../config/database');

// Get user notifications
exports.getNotifications = (req, res) => {
  db.all(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [req.user.id],
    (err, notifications) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch notifications' });
      }
      res.json(notifications);
    }
  );
};

// Mark notification as read
exports.markAsRead = (req, res) => {
  const { id } = req.params;

  db.run(
    'UPDATE notifications SET read_status = 1 WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to mark notification as read' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.json({ message: 'Notification marked as read' });
    }
  );
};

// Mark all notifications as read
exports.markAllAsRead = (req, res) => {
  db.run(
    'UPDATE notifications SET read_status = 1 WHERE user_id = ?',
    [req.user.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to mark notifications as read' });
      }

      res.json({ 
        message: 'All notifications marked as read',
        updated: this.changes
      });
    }
  );
};

// Get unread notification count
exports.getUnreadCount = (req, res) => {
  db.get(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read_status = 0',
    [req.user.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to get unread count' });
      }
      res.json({ unreadCount: result.count });
    }
  );
};
