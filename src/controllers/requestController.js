const db = require('../config/database');
const { sendEmail, sendSMS } = require('../config/notifications');

// Get all date requests
exports.getRequests = (req, res) => {
  db.all(
    `SELECT dr.*, u.username, u.email 
     FROM date_requests dr 
     JOIN users u ON dr.user_id = u.id 
     ORDER BY dr.created_at DESC`,
    [],
    (err, requests) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch requests' });
      }
      res.json(requests);
    }
  );
};

// Create a new date request
exports.createRequest = async (req, res) => {
  const { request_type, title, description, location } = req.body;

  if (!request_type || !title) {
    return res.status(400).json({ error: 'Request type and title are required' });
  }

  if (!['place', 'food'].includes(request_type)) {
    return res.status(400).json({ error: 'Request type must be "place" or "food"' });
  }

  db.run(
    'INSERT INTO date_requests (user_id, request_type, title, description, location) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, request_type, title, description, location],
    async function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create request' });
      }

      const requestId = this.lastID;

      // Create notification for the partner
      db.all('SELECT * FROM users WHERE id != ?', [req.user.id], async (err, users) => {
        if (!err && users.length > 0) {
          for (const user of users) {
            const notificationMessage = `${req.user.username} membuat request ${request_type === 'place' ? 'tempat' : 'makanan'}: ${title}`;
            
            db.run(
              'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
              [user.id, 'date_request', notificationMessage]
            );

            // Send email notification
            if (user.email) {
              await sendEmail(
                user.email,
                'Request Kencan Baru',
                notificationMessage,
                `<p>${notificationMessage}</p><p>Deskripsi: ${description || 'Tidak ada'}</p>`
              );
            }

            // Send SMS notification
            if (user.phone) {
              await sendSMS(user.phone, notificationMessage);
            }
          }
        }
      });

      res.status(201).json({
        message: 'Request created successfully',
        request: {
          id: requestId,
          user_id: req.user.id,
          request_type,
          title,
          description,
          location,
          status: 'pending'
        }
      });
    }
  );
};

// Update request status
exports.updateRequestStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run(
    'UPDATE date_requests SET status = ? WHERE id = ?',
    [status, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update status' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Request not found' });
      }

      res.json({ message: 'Status updated successfully' });
    }
  );
};

// Delete a date request
exports.deleteRequest = (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM date_requests WHERE id = ?', [id], (err, request) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    db.run('DELETE FROM date_requests WHERE id = ?', [id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete request' });
      }

      res.json({ message: 'Request deleted successfully' });
    });
  });
};
