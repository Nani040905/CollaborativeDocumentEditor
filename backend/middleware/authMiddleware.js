import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized. Authentication token missing.' });
    }

    try {
        // Decode and verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find matching user, exclude their password hash for security
        req.user = await User.findById(decoded.userId).select('-password');
        
        if (!req.user) {
            return res.status(401).json({ message: 'User session invalid. Account not found.' });
        }
        
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized. Access token has expired or is invalid.' });
    }
};
