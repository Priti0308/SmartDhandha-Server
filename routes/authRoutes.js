const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// ---
// @route   POST /api/auth/register
// @desc    Creates a new user account without OTP verification.
// @access  Public
// ---
router.post("/register", async (req, res) => {
    console.log("\n--- Direct Registration Attempt ---");
    const { fullName, businessName, email, mobile, password } = req.body;
    
    // Basic Validation
    if (!fullName || !businessName || !email || !mobile || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        // Check if a user with this email or mobile already exists (Mongoose will handle the unique index error later, but this check is cleaner)
        if (await User.findOne({ email })) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }
        if (await User.findOne({ mobile })) {
            return res.status(409).json({ message: "An account with this mobile number already exists." });
        }

        console.log("[1/3] Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user with default role 'user' and isApproved: false
        const newUser = new User({
            fullName,
            businessName,
            email,
            mobile,
            password: hashedPassword,
            role: 'user', 
            isApproved: false, // Default: needs superadmin approval
        });
        
        console.log("[2/3] Saving user to database...");
        await newUser.save(); 

        // After successful save, update the user with their own ID as the businessId
        // This is necessary for the main 'user' (owner) to manage their business
        newUser.businessId = newUser._id;
        await newUser.save();

        console.log("[3/3] Creating JWT token...");
        const payload = {
            id: newUser._id,
            fullName: newUser.fullName,
            role: newUser.role,
            isApproved: newUser.isApproved
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

        console.log("--- Registration Successful ---");
        res.status(201).json({
            message: "Registration successful! Pending Admin Approval.",
            token,
            user: { 
                id: newUser._id, 
                fullName: newUser.fullName, 
                email: newUser.email,
                role: newUser.role,
                isApproved: newUser.isApproved 
            },
        });

    } catch (error) {
        console.error("--- REGISTRATION CRASHED ---");
        console.error("Error message:", error.message);

        // Handle unique constraint error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(409).json({ message: `An account with this ${field} already exists.` });
        }

        res.status(500).json({ message: "An internal server error occurred during registration." });
    }
});

// ---
// @route   POST /api/auth/login
// @desc    Authenticates a user and returns a token.
// @access  Public
// ---
router.post("/login", async (req, res) => {
    const { mobile, password } = req.body;
    if (!mobile || !password) {
        return res.status(400).json({ message: "Please enter both mobile number and password." });
    }

    try {
        const user = await User.findOne({ mobile: mobile });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials. User not found." });
        }
        
        // 1. Check for approval (only users need approval, not superadmin)
        const userRole = user.role ? user.role.toLowerCase() : 'user';
        if (userRole !== 'superadmin' && !user.isApproved) {
            return res.status(403).json({ message: "Account is pending approval from admin." });
        }

        // 2. Compare the submitted password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials. Incorrect password." });
        }

        // 3. Create and sign JWT token
        const payload = {
            id: user._id,
            fullName: user.fullName,
            role: user.role,
            businessId: user.businessId // Include businessId
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 4. Send the token back to the client
        res.status(200).json({
            message: "Logged in successfully!",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
                businessName: user.businessName,
                isApproved: user.isApproved,
                businessId: user.businessId
            },
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
});

module.exports = router;