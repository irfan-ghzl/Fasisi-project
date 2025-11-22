const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const galleryController = require('../controllers/galleryController');
const authMiddleware = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isVideo = file.mimetype.startsWith('video/');
    const uploadPath = isVideo 
      ? path.join(__dirname, '../../public/uploads/videos')
      : path.join(__dirname, '../../public/uploads/photos');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  }
});

router.get('/', authMiddleware, galleryController.getGallery);
router.post('/upload', authMiddleware, upload.single('file'), galleryController.uploadMedia);
router.delete('/:id', authMiddleware, galleryController.deleteMedia);

module.exports = router;
