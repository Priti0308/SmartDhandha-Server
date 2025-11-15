const express = require('express');
const router = express.Router();
const { protect, superadmin } = require('../middleware/authMiddleware');

const {
    getSystemStats,
    getAllUsers,
    deleteUser,
    approveUser,
    updateMySettings, 
} = require('../controllers/superAdminController'); 

router.route('/stats').get(protect, superadmin, getSystemStats);
router.route('/users').get(protect, superadmin, getAllUsers);
router.route('/users/:id').delete(protect, superadmin, deleteUser);

router.route('/users/:id/approve').patch(protect, superadmin, approveUser);

router.route('/settings').patch(protect, superadmin, updateMySettings);

module.exports = router;
