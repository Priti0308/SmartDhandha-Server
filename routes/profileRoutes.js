const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, triggerBackup } = require('../controllers/profileController');
const upload = require('../config/cloudinary');

// --- 1. Import 'protect' ONLY ---
const { protect } = require('../middleware/authMiddleware');

// --- Profile Routes ---
router
  .route('/')

  .get(protect, getProfile) 
  .put(protect, upload.single('avatar'), updateProfile);

// --- Backup Route ---
router.post('/backup', protect, triggerBackup);

module.exports = router;