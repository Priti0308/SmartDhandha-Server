const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

// ---
// @route   POST /api/auth/send-otp
// @desc    Sends a verification OTP to a user's email.
// @access  Public
// ---
router.post("/send-otp", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minute expiry
    try {
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ email, otp, otpExpires: otpExpiry });
        } else {
            
            if (user.isVerified) {
                return res.status(409).json({ message: "An account with this email already exists." });
            }
            user.otp = otp;
            user.otpExpires = otpExpiry;
        }
        await user.save();
        await sendEmail(email, "Your SmartDhandha Verification Code", `Your OTP is: ${otp}`);
        res.status(200).json({ message: "OTP sent successfully." });
    } catch (error) {
        console.error("OTP Send Error:", error);
        res.status(500).json({ message: "Failed to send OTP due to a server error." });
    }
});

// ---
// @route   POST /api/auth/login
// @desc    Authenticates a user and returns a token.
// @access  Public
// ---
router.post("/login", async (req, res) => {
    // Your code was already correct to use 'mobile'
    const { mobile, password } = req.body;
    if (!mobile || !password) {
        return res.status(400).json({ message: "Please enter both mobile number and password." });
    }

    try {
        // 1. Find the user by their mobile number
        const user = await User.findOne({ mobile: mobile });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials. User not found." });
        }
        
        // Ensure user account is verified before allowing login
        if (!user.isVerified) {
            return res.status(403).json({ message: "Account not verified. Please check your email to complete registration." });
        }

        // 2. Compare the submitted password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials. Incorrect password." });
        }

        // 3. If credentials are correct, create and sign a JWT token
        const payload = {
            id: user._id,
            fullName: user.fullName,
            role: user.role, // <-- *** CRITICAL FIX 1: Add role to JWT payload ***
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "7d" } // Token will be valid for 7 days
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
                role: user.role, // <-- *** CRITICAL FIX 2: Send role to frontend ***
            },
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
});
// ---
// @route   POST /api/auth/register
// @desc    Verifies OTP and creates a new user account.
// @access  Public
// ---
router.post("/register", async (req, res) => {
    console.log("\n--- New Registration Attempt ---");
    const { fullName, businessName, email, mobile, password, otp } = req.body;
    
    try {
        console.log("[1/6] Finding user by email:", email);
        const user = await User.findOne({ email });
        if (!user) {
            console.error("[FAIL] User not found for this email.");
            return res.status(400).json({ message: "Please request an OTP first." });
        }

        console.log("[2/6] Validating OTP...");
        if (user.otp !== otp) {
            console.error("[FAIL] Invalid OTP.");
            return res.status(400).json({ message: "The OTP you entered is incorrect." });
        }
        if (user.otpExpires < new Date()) {
            console.error("[FAIL] OTP has expired.");
            return res.status(400).json({ message: "Your OTP has expired." });
        }

        console.log("[3/6] Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("[4/6] Updating user document...");
        user.fullName = fullName;
        user.businessName = businessName;
        user.mobile = mobile;
        user.password = hashedPassword;
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        // user.role is already 'user' by default from your model, so no change needed.
        
        console.log("[5/6] Saving user to database...");
        await user.save(); 

        console.log("[6/6] Creating JWT token...");
        // --- Create payload with role ---
        const payload = {
            id: user._id,
            fullName: user.fullName,
            role: user.role, // This will be 'user'
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

        console.log("--- Registration Successful ---");
        res.status(201).json({
            message: "User registered successfully!",
            token,
            user: { 
                id: user._id, 
                fullName: user.fullName, 
                email: user.email,
                role: user.role, // <-- Send role on register too
            },
        });

    } catch (error) {
        console.error("--- REGISTRATION CRASHED ---");
        console.error("Error message:", error.message);
        console.error("Full Error:", error);

        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(409).json({ message: `An account with this ${field} already exists.` });
        }

        res.status(500).json({ message: "An internal server error occurred during registration." });
    }
});


module.exports = router;