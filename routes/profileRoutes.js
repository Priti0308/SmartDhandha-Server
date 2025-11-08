const express = require('express');
const router = express.Router();
// 1. Import the controllers
const { getProfile, updateProfile, triggerBackup } = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary');


// --- THIS IS THE FIX ---
/**
 * @route   GET /api/profile/me
 * @desc    Get current user's profile (for auth)
 * @access  Private
 */
router.get('/me', authMiddleware, getProfile);
// --- END OF FIX ---


/**
 * @route   PUT /api/profile
 * @desc    Update user's profile
 * @access  Private
 */
router.put('/', authMiddleware, upload.single('avatar'), updateProfile);


/**
 * @route   POST /api/profile/backup
 * @desc    Trigger a manual data backup
 * @access  Private
 */
router.post('/backup', authMiddleware, triggerBackup);

module.exports = router;