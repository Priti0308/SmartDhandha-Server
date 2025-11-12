const express = require('express');
const router = express.Router();

// Import the middleware functions from your file
const {
    protect,
    superadmin
} = require('../middleware/authMiddleware'); // Adjust path if needed

// Import the new controller functions
const {
    getSystemStats,
    getAllUsers,
    deleteUser
} = require('../controllers/superAdminController'); // Adjust path if needed

// --- Define Superadmin Routes ---
// All routes in this file are first protected by 'protect' (checks login)
// and then by 'superadmin' (checks role).

// GET /api/superadmin/stats
router.route('/stats').get(protect, superadmin, getSystemStats);

// GET /api/superadmin/users
router.route('/users').get(protect, superadmin, getAllUsers);

// DELETE /api/superadmin/users/:id
router.route('/users/:id').delete(protect, superadmin, deleteUser);

module.exports = router;