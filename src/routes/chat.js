const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');

router.get('/history/:partnerId', authMiddleware, chatController.getChatHistory);
router.post('/send', authMiddleware, chatController.sendMessage);
router.patch('/read/:partnerId', authMiddleware, chatController.markAsRead);
router.get('/unread-count', authMiddleware, chatController.getUnreadCount);

module.exports = router;
