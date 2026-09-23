const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const protect = async (req, res, next) => {
    let token;

    try {
        // Check Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        // If token doesn't exist
        if (!token) {
            return res.status(401).json({
                message: "Not authorized, token missing"
            });
        }

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Find user from token
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        // Attach user to request
        req.user = user;
        next();

    } catch (error) {
        console.error("Auth middleware error:", error);

        return res.status(401).json({
            message: "Not authorized, invalid token"
        });
    }
};

module.exports = protect;
