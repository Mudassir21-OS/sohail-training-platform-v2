const jwt = require('jsonwebtoken');

// Protect routes - requires a valid JWT
const protect = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: { message: 'Not authorized, no token', code: 'UNAUTHORIZED' } });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: { message: 'Not authorized, token failed', code: 'UNAUTHORIZED' } });
        }
        req.user = decoded; // Attach the decoded user payload to the request
        next();
    });
};

// Admin only routes - checks the role in the JWT payload
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ error: { message: 'Not authorized as an admin', code: 'FORBIDDEN' } });
    }
};

module.exports = { protect, adminOnly };