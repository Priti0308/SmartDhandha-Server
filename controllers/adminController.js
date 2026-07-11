const User = require('../models/User');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

// @desc    Update admin's own settings
// @route   PATCH /api/admin/settings
// @access  AdminOnly
const updateMySettings = async (req, res) => {
    try {
        const { mobile, password } = req.body;
        
        const user = await Admin.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        // Update mobile if provided
        if (mobile && mobile !== '') {
            user.mobile = mobile;
        }

        // Update password if provided
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

// @desc    Get system-wide stats for Admin
// @route   GET /api/admin/stats
// @access  AdminOnly
const getSystemStats = async (req, res) => {
    try {
        // Count all business owners in User collection (naturally excluding the admin since it lives in the Admin collection)
        const totalUsers = await User.countDocuments();
        
        // Count approved and pending business owners
        const totalCompanies = await User.countDocuments({ isApproved: true });
        
        res.json({
            totalUsers,
            totalCompanies,
            totalAdmins: 0, // Since employee admins is 0 or separate
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (business owners)
// @route   GET /api/admin/users
// @access  AdminOnly
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); 
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a business owner
// @route   DELETE /api/admin/users/:id
// @access  AdminOnly
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne(); 
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve a business owner
// @route   PATCH /api/admin/users/:id/approve
// @access  AdminOnly
const approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.isApproved = true;
            await user.save();
            res.json({ message: 'User approved successfully.' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update any user's profile by Admin
// @route   PATCH /api/admin/users/:id
// @access  AdminOnly
const updateUserByAdmin = async (req, res) => {
    try {
        const { fullName, email, mobile, businessName, role, isApproved } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (fullName !== undefined) user.fullName = fullName;
        if (email !== undefined) user.email = email;
        if (mobile !== undefined) user.mobile = mobile;
        if (businessName !== undefined) user.businessName = businessName;
        if (role !== undefined) user.role = role;
        if (isApproved !== undefined) user.isApproved = isApproved;

        await user.save();

        const updatedUser = user.toObject();
        delete updatedUser.password;

        res.json({ message: 'User profile updated successfully.', user: updatedUser });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ message: `An account with this ${field} already exists.` });
        }
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSystemStats,
    getAllUsers,
    deleteUser,
    approveUser,
    updateMySettings,
    updateUserByAdmin,
};
