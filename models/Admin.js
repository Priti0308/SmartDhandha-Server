const mongoose = require("mongoose");
const { Schema } = mongoose;

const adminSchema = new Schema({
    // 🔑 CORE CREDENTIALS 🔑
    mobile: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'admin',
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);