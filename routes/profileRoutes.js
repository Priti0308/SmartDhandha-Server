const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, triggerBackup } = require('../controllers/profileController');
const upload = require('../config/cloudinary');

// --- 1. CHANGE THIS LINE ---
// Import the specific middleware functions you need
const { protect, isBusinessMember } = require('../middleware/authMiddleware');

// --- Profile Routes ---
// Handles GET /api/profile
// Handles PUT /api/profile
router
  .route('/')
  // --- 2. UPDATE THIS LINE ---
  // Use 'protect' and 'isBusinessMember' instead of 'authMiddleware'
  .get(protect, isBusinessMember, getProfile)
  
  // --- 3. UPDATE THIS LINE ---
  // Also apply 'protect' and 'isBusinessMember' here
  .put(protect, isBusinessMember, upload.single('avatar'), updateProfile);

// --- CORRECTED: Backup Route ---
/**
 * @route   POST /api/profile/backup
 * @desc    Trigger a manual data backup
 * @access  Private
 */
// --- 4. UPDATE THIS LINE ---
// Use 'protect' and 'isBusinessMember' here too
router.post('/backup', protect, isBusinessMember, triggerBackup);

module.exports = router;