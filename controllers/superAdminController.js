const User = require('../models/User');
const Admin = require('../models/Admin'); // 🔑 NEW: Import Admin model
const bcrypt = require('bcryptjs'); 

// @desc    Update superadmin's own settings
// @route   PATCH /api/superadmin/settings
// @access  Superadmin
const updateMySettings = async (req, res) => {
    try {
        const { mobile, password } = req.body;
        
        // The logged-in user is guaranteed to be a User model instance (Owner/Superadmin)
        const user = await User.findById(req.user.id);

        if (!user) {
            // This case should ideally not happen if middleware works
            return res.status(404).json({ message: 'User not found.' });
        }

        // Fix: Force role to lowercase before saving to pass schema validation
        if (user.role) {
            user.role = user.role.toLowerCase();
        }

        if (mobile && mobile !== '') {
            // If the user's mobile is being updated, we check for conflicts in both User and Admin tables
            const mobileConflict = await Promise.all([
                User.findOne({ mobile: mobile, _id: { $ne: user._id } }),
                Admin.findOne({ mobile: mobile }),
            ]);

            if (mobileConflict[0] || mobileConflict[1]) {
                return res.status(409).json({ message: 'Mobile number is already in use.' });
            }

            user.mobile = mobile;
        }

        if (password && password !== '') {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.json({ message: 'Settings updated successfully.' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get system-wide stats for Superadmin
// @route   GET /api/superadmin/stats
// @access  Superadmin
const getSystemStats = async (req, res) => {
    try {
        // 🔑 FIX: Count users and admins separately
        const totalOwnersAndSuperadmins = await User.countDocuments();
        const totalAdmins = await Admin.countDocuments();
        
        const totalUsers = totalOwnersAndSuperadmins + totalAdmins;

        // Count only Company Owners (role: 'user')
        const totalCompanies = await User.countDocuments({ role: 'user' });

        res.json({
            totalUsers,
            totalCompanies,
            totalAdmins,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (for Superadmin user management)
// @route   GET /api/superadmin/users
// @access  Superadmin
const getAllUsers = async (req, res) => {
    try {
        // 🔑 FIX: Query both collections and combine results
        const ownersAndSuperadmins = await User.find({}).select('-password'); 
        const admins = await Admin.find({}).select('-password');
        
        // Combine results
        const allUsers = [...ownersAndSuperadmins, ...admins];
        res.json(allUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a user (must check both models)
// @route   DELETE /api/superadmin/users/:id
// @access  Superadmin
const deleteUser = async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        
        if (!user) {
             user = await Admin.findById(req.params.id); // Check Admin collection
        }

        if (user) {
            if (user.role.toLowerCase() === 'admin') {
                await Admin.deleteOne({ _id: req.params.id });
            } else {
                await User.deleteOne({ _id: req.params.id });
            }
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve a pending user
// @route   PATCH /api/superadmin/users/:id/approve
// @access  Superadmin
const approveUser = async (req, res) => {
    try {
        // Only the main User model requires approval
        const user = await User.findById(req.params.id); 

        if (user) {
            user.isApproved = true;
            user.role = user.role.toLowerCase(); // Maintain case consistency
            await user.save();
            res.json({ message: 'User approved successfully.' });
        } else {
            res.status(404).json({ message: 'User not found in Owner/Superadmin list.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSystemStats,
    getAllUsers,
    deleteUser,
    approveUser,
    updateMySettings,
};