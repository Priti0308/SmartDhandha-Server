const User = require('../models/User'); // Adjust path if needed

// @desc    Get user profile
// @route   GET /api/profile
const getProfile = async (req, res) => {
  try {
    // req.user.id comes from your authMiddleware
    const user = await User.findById(req.user.id).select('-password -otp');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
const updateProfile = async (req, res) => {
  try {
    const { fullName, mobile, email, businessName, address } = req.body; // Added email and businessName
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if they are provided
    user.fullName = fullName || user.fullName;
    user.mobile = mobile || user.mobile;
    user.email = email || user.email; // Allow email update
    user.businessName = businessName || user.businessName;
    user.address = address || user.address; // Allow businessName update

    if (req.file) {
      user.avatar = req.file.path; // URL from Cloudinary
    }

    const updatedUser = await user.save();
    
    // Send back the updated user, minus sensitive fields
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    delete userResponse.otp;
    delete userResponse.otpExpires;

    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Error in updateProfile:', error);
    // Handle potential duplicate key error if email or mobile is changed to one that already exists
    if (error.code === 11000) {
        return res.status(400).json({ message: 'Email or mobile number already in use.' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Trigger a manual data backup
// @route   POST /api/profile/backup
const triggerBackup = async (req, res) => {
    try {
        // Here you would add your logic to back up this user's data
        // For example, exporting their data to a file or another service.
        
        console.log(`Backup triggered for user: ${req.user.id}`);
        
        // Find the user and update their 'lastBackup' timestamp
        const lastBackupTime = new Date();
        await User.findByIdAndUpdate(req.user.id, { lastBackup: lastBackupTime });

        // Send a success response
        res.status(200).json({ 
            message: "Backup completed successfully!",
            lastBackup: lastBackupTime 
        });

    } catch (error) {
        console.error('Error in triggerBackup:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { 
    getProfile, 
    updateProfile,
    triggerBackup // <-- Export the new function
};
