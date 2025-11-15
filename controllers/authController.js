// backend/controllers/authController.js

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const generateOtp = require("../utils/otpGenerate");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User"); // Make sure your User model is defined correctly

// Step 1: Send OTP for a new registration
const sendRegistrationOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if a verified user with this email already exists
    const existingVerifiedUser = await User.findOne({ email, isVerified: true });
    if (existingVerifiedUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // <-- CHANGED to 2 minutes

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, otp, otpExpires: otpExpiry });
    } else {
      user.otp = otp;
      user.otpExpires = otpExpiry;
      user.isVerified = false; // Reset verification for re-attempts
    }
    await user.save();

    await sendEmail(email, "Your SmartDhandha OTP Code", `Your verification code is: ${otp}`);

    res.status(200).json({ message: "OTP sent successfully to your email." });

  } catch (error) {
    console.error("Error in sendRegistrationOtp:", error);
    res.status(500).json({ message: "Server error while sending OTP." });
  }
};


// Step 2: Verify OTP and Create the full User account
const registerAndVerify = async (req, res) => {
  try {
    const { fullName, businessName, mobile, email, password, otp } = req.body;

    // Validate all fields are present
    if (!fullName || !businessName || !mobile || !email || !password || !otp) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "OTP not sent for this email. Please request an OTP first." });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP provided." });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user with all details
    user.fullName = fullName;
    user.businessName = businessName;
    user.mobile = mobile;
    user.password = hashedPassword;
    user.isVerified = true;
    user.otp = undefined; // Clear OTP fields
    user.otpExpires = undefined;

    await user.save();

    // Generate JWT Token for immediate login
    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({
      message: "Registration successful!",
      token,
      user: { id: user._id, email: user.email, fullName: user.fullName },
    });

  } catch (error) {
    console.error("Error in registerAndVerify:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
};


// Note: Your loginUser function is fine for a separate login route
const loginUser = async (req, res) => {
    try {
        const { mobile, password } = req.body;

        // 1. Validate input
        if (!mobile || !password) {
            return res.status(400).json({ message: "Mobile and password are required" });
        }

        // 2. Find user by mobile number
        const user = await User.findOne({ mobile });
        if (!user) {
            // Use a generic error message for security
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 3. Check if user's account is verified (must be verified to log in)
        if (!user.isVerified) {
            return res.status(403).json({ message: "Account not verified. Please complete OTP verification." });
        }

        // 4. Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 5. Generate JWT Token
        const payload = { id: user._id, email: user.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1d", 
        });

        // 6. Send successful response with token and public user info
        res.status(200).json({
            message: "Login successful!",
            token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                businessName: user.businessName
            },
        });

    } catch (error) {
        console.error("Error in loginUser:", error);
        res.status(500).json({ message: "Server error during login." });
    }
};

module.exports = {
  sendRegistrationOtp,
  registerAndVerify,
  loginUser,
};