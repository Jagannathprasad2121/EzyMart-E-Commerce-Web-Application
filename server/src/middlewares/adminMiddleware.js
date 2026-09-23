const admin = (req, res, next) => {

    // Check if user exists
    if (!req.user) {
        return res.status(401).json({
            message: "Not authorized"
        });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: "Access denied. Admin only."
        });
    }

    // User is admin
    next();
};

module.exports = admin;
