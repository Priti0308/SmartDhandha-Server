const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');

const {
    getSystemStats,
    getAllUsers,
    deleteUser,
    approveUser,
    updateMySettings,
    updateUserByAdmin,
} = require('../controllers/adminController');

router.route('/stats').get(protect, adminOnly, getSystemStats);
router.route('/users').get(protect, adminOnly, getAllUsers);
router.route('/users/:id')
    .delete(protect, adminOnly, deleteUser)
    .patch(protect, adminOnly, updateUserByAdmin);

router.route('/users/:id/approve').patch(protect, adminOnly, approveUser);

router.route('/settings').patch(protect, adminOnly, updateMySettings);

module.exports = router;
