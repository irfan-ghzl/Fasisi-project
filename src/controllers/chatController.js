const db = require('../config/database');

// Get chat history between users
exports.getChatHistory = (req, res) => {
  const { partnerId } = req.params;

  db.all(
    `SELECT cm.*, 
            sender.username as sender_username,
            receiver.username as receiver_username
     FROM chat_messages cm
     JOIN users sender ON cm.sender_id = sender.id
     JOIN users receiver ON cm.receiver_id = receiver.id
     WHERE (cm.sender_id = ? AND cm.receiver_id = ?) 
        OR (cm.sender_id = ? AND cm.receiver_id = ?)
     ORDER BY cm.created_at ASC`,
    [req.user.id, partnerId, partnerId, req.user.id],
    (err, messages) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch chat history' });
      }
      res.json(messages);
    }
  );
};

// Send a new message
exports.sendMessage = (req, res) => {
  const { receiverId, message } = req.body;

  if (!receiverId || !message) {
    return res.status(400).json({ error: 'Receiver and message are required' });
  }

  db.run(
    'INSERT INTO chat_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
    [req.user.id, receiverId, message],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to send message' });
      }

      const messageId = this.lastID;

      // Create notification for receiver
      db.get('SELECT * FROM users WHERE id = ?', [receiverId], (err, receiver) => {
        if (!err && receiver) {
          const notificationMessage = `Pesan baru dari ${req.user.username}`;
          
          db.run(
            'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
            [receiverId, 'chat_message', notificationMessage]
          );
        }
      });

      res.status(201).json({
        message: 'Message sent successfully',
        messageData: {
          id: messageId,
          sender_id: req.user.id,
          receiver_id: receiverId,
          message,
          read_status: false
        }
      });
    }
  );
};

// Mark messages as read
exports.markAsRead = (req, res) => {
  const { partnerId } = req.params;

  db.run(
    'UPDATE chat_messages SET read_status = 1 WHERE receiver_id = ? AND sender_id = ?',
    [req.user.id, partnerId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to mark messages as read' });
      }

      res.json({ 
        message: 'Messages marked as read',
        updated: this.changes
      });
    }
  );
};

// Get unread message count
exports.getUnreadCount = (req, res) => {
  db.get(
    'SELECT COUNT(*) as count FROM chat_messages WHERE receiver_id = ? AND read_status = 0',
    [req.user.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to get unread count' });
      }
      res.json({ unreadCount: result.count });
    }
  );
};
