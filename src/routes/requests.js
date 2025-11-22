const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, requestController.getRequests);
router.post('/', authMiddleware, requestController.createRequest);
router.patch('/:id/status', authMiddleware, requestController.updateRequestStatus);
router.delete('/:id', authMiddleware, requestController.deleteRequest);

module.exports = router;
