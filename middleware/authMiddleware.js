const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const Admin = require('../models/Admin'); 

// 1. JWT verification and user population
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Check in User collection first
            let user = await User.findById(decoded.id).select('-password');
            
            // If not found in User, check in Admin collection
            if (!user) {
                user = await Admin.findById(decoded.id).select('-password');
            }

            req.user = user;

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next(); 

        } catch (error) {
            console.error('Token verification failed:', error.message);
            res.status(401).json({ message: 'Not authorized, token is invalid or expired' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

// 2. ADMIN ONLY CHECK
// Checks if the logged-in user's role is 'admin' (System Owner)
const adminOnly = (req, res, next) => {
    const userRole = req.user ? req.user.role.toLowerCase() : '';

    if (userRole === 'admin') {
        next(); 
    } else {
        res.status(403);
        throw new Error('Not authorized. Admin access only.');
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
        res.status(403); 
        throw new Error('Not authorized. Business member access only.');
    }
};

module.exports = {
    protect,
    superadmin: adminOnly, // fallback alias
    adminOnly,
    isCompanyOwner,
    isBusinessMember
};