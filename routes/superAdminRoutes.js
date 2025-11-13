const express = require('express');
const router = express.Router();
const { protect, superadmin } = require('../middleware/authMiddleware');

const {
    getSystemStats,
    getAllUsers,
    deleteUser,
    approveUser, // <-- 1. Make sure this is imported
} = require('../controllers/superAdminController'); 

// --- Your existing routes ---
router.route('/stats').get(protect, superadmin, getSystemStats);
router.route('/users').get(protect, superadmin, getAllUsers);
router.route('/users/:id').delete(protect, superadmin, deleteUser);

// --- 2. ADD THIS NEW LINE ---
// This creates the PATCH /api/superadmin/users/:id/approve route
router.route('/users/:id/approve').patch(protect, superadmin, approveUser);

module.exports = router;