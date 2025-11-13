const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
    },
    businessName: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    mobile: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple users to have a null value before registration is complete
    },
    address: {
        type: String,
    },
    password: {
        type: String,
    },
    otp: {
        type: String,
    },
    otpExpires: {
        type: Date,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isApproved: {
        type: Boolean,
        default: false, // New users are NOT approved by default
    },
    avatar: {
        type: String,
        // Default placeholder image for new users
        default: 'https://via.placeholder.com/150/f472b6/ffffff?text=U'
    },
    
    // --- UPDATED ROLE FIELD ---
    role: {
        type: String,
        // 'user' = Company Owner
        // 'admin' = Employee (invited by 'user')
        // 'superadmin' = You (system owner)
        enum: ['user', 'admin', 'superadmin'], 
        default: 'user',
    },

    // --- NEW BUSINESS ID FIELD ---
    // This ID groups a 'user' (Owner) and their 'admin' (Employees) together.
    // It will be null for the 'superadmin'.
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        sparse: true, // Allows null values, which is needed for superadmin
    }

}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

module.exports = mongoose.model("User", userSchema);