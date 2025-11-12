const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, triggerBackup } = require('../controllers/profileController');
const upload = require('../config/cloudinary');

// --- 1. Import 'protect' ONLY ---
const { protect } = require('../middleware/authMiddleware');

// --- Profile Routes ---
router
  .route('/')
  // --- 2. THIS IS THE FIX ---
  // We ONLY use 'protect'. We remove 'isBusinessMember'.
  // Now, ANY logged-in user (user, admin, or superadmin) can get their own profile.
  .get(protect, getProfile) 
  .put(protect, upload.single('avatar'), updateProfile);

// --- Backup Route ---
router.post('/backup', protect, triggerBackup);

module.exports = router;