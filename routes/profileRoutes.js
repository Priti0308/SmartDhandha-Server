const express = require('express');
const router = express.Router();
// 1. Import the new 'triggerBackup' function from the controller
const { getProfile, updateProfile, triggerBackup } = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary');

// --- Profile Routes ---
// Handles GET /api/profile
// Handles PUT /api/profile
router
  .route('/')
  .get(authMiddleware, getProfile)
  .put(authMiddleware, upload.single('avatar'), updateProfile);

// --- CORRECTED: Backup Route ---
/**
 * @route   POST /api/profile/backup
 * @desc    Trigger a manual data backup
 * @access  Private
 */
// 2. Use the imported controller function directly
router.post('/backup', authMiddleware, triggerBackup);

module.exports = router;