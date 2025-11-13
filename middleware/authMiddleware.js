const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path if needed

// 1. This is your existing function, renamed to 'protect'
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next(); // Proceed to the next middleware or controller

        } catch (error) {
            console.error('Token verification failed:', error.message);
            res.status(401).json({ message: 'Not authorized, token is invalid or expired' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

// --- ADD THESE NEW FUNCTIONS ---

// 2. SUPERADMIN CHECK
// Checks if the logged-in user's role is 'superadmin'
// This is the fixed code
const superadmin = (req, res, next) => {
    // --- THIS IS THE FIX ---
    // We convert the role from the database to lowercase before checking it
    const userRole = req.user ? req.user.role.toLowerCase() : '';

    if (userRole === 'superadmin') {
        next(); // The check will now pass
    } else {
        res.status(403);
        throw new Error('Not authorized. Superadmin access only.');
    }
};

// 3. COMPANY OWNER CHECK
// Checks if the logged-in user's role is 'user' (Company Owner)
const isCompanyOwner = (req, res, next) => {
    if (req.user && req.user.role === 'user') {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized. Company Owner access only.');
    }
};

// 4. BUSINESS MEMBER CHECK
// Checks if the user is EITHER 'user' (Owner) OR 'admin' (Employee)
const isBusinessMember = (req, res, next) => {
    if (req.user && (req.user.role === 'user' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403); // 403 Forbidden
        throw new Error('Not authorized. Business member access only.');
    }
};


// --- THIS IS THE MOST IMPORTANT CHANGE ---
// Instead of exporting one function, we now export all of them as an object
module.exports = {
    protect,
    superadmin,
    isCompanyOwner,
    isBusinessMember
};