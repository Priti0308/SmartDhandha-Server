const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Visitor name is required.'],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Visitor phone number is required.'],
        trim: true,
    },
    purpose: {
        type: String,
        default: 'Meeting',
        trim: true,
    },
    whomToMeet: {
        type: String,
        trim: true,
    },
    checkInTime: {
        type: Date,
        required: true,
        default: Date.now,
    },
    checkOutTime: {
        type: Date,
        default: null,
    },
    photo: {
        type: String, // Stores the Base64 Data URL
        default: null,
    },
     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional: if you have user accounts
}, { timestamps: true });

const Visitor = mongoose.model('Visitor', visitorSchema);

module.exports = Visitor;