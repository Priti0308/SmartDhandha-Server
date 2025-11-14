const mongoose = require("mongoose");
const { Schema } = mongoose;

const adminSchema = new Schema({
    // 🔑 CORE CREDENTIALS 🔑
    mobile: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },

    // --- Linkage ---
    // The ID of the Business Owner's document (in the User collection)
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Links to the User who is the business owner
        required: true,
    },
    
    // The role within the system, fixed to 'admin'
    role: {
        type: String,
        enum: ['admin'], 
        default: 'admin',
        required: true,
    },
    
    // 💡 Note: Other employee details (name, email) should now be managed 
    // either separately or inferred from the related business/user data 
    // to keep this model strictly credential-based as requested.

}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);