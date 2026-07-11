const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true, // Now required on registration
    },
    businessName: {
        type: String,
        required: true, // Now required on registration
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
        required: true, // Now required on registration
        unique: true,
        trim: true,
    },
    address: {
        type: String,
    },
    password: {
        type: String,
        required: true, // Now required on registration
    },
    isApproved: {
        type: Boolean,
        default: false, // User still needs approval from 'superadmin'
    },
    avatar: {
        type: String,
        default: 'https://via.placeholder.com/150/f472b6/ffffff?text=U'
    },
    role: {
        type: String,
        // 'user' = Company / Business Owner (Default registration)
        // 'admin' = Sub-user / Employee (Invited by 'user')
        enum: ['user', 'admin'], 
        default: 'user',
    },
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        sparse: true, 
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);