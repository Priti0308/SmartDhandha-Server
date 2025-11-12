const User = require('../models/User'); // Adjust path if needed
// const Ledger = require('../models/ledgerModel'); // Import other models as needed

// @desc    Get system-wide stats for Superadmin
// @route   GET /api/superadmin/stats
// @access  Superadmin
const getSystemStats = async (req, res) => {
    try {
        // Count all users
        const totalUsers = await User.countDocuments();
        
        // Count only Company Owners (role: 'user')
        const totalCompanies = await User.countDocuments({ role: 'user' });
        
        // Count only Employees (role: 'admin')
        const totalAdmins = await User.countDocuments({ role: 'admin' });

        // --- Example: Add more stats ---
        // const totalLedgerEntries = await Ledger.countDocuments();

        res.json({
            totalUsers,
            totalCompanies,
            totalAdmins,
            // totalLedgerEntries,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (for Superadmin user management)
// @route   GET /api/superadmin/users
// @access  Superadmin
const getAllUsers = async (req, res) => {
    try {
        // Get all users, but don't send their passwords
        const users = await User.find({}).select('-password'); 
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a user
// @route   DELETE /api/superadmin/users/:id
// @access  Superadmin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Add any cleanup logic here (e.g., delete their business data)
            await user.deleteOne(); // or user.remove() if using older mongoose
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSystemStats,
    getAllUsers,
    deleteUser,
};