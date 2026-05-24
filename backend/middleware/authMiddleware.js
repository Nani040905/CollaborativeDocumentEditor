import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication Gate/Firewall Middleware.
 * Extracts the session JWT token from incoming HTTP cookie payloads,
 * decrypts and verifies the signature using `JWT_SECRET`,
 * fetches the corresponding active user record (excluding password crypt hashes for maximum security),
 * and assigns the profile to `req.user` before continuing route processing.
 * 
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {Promise<void>} Calls next() or returns 401 Unauthorized.
 */
export const protect = async (req, res, next) => {
    // Read the authorization cookie token sent by the browser client
    let token = req.cookies.token;

    // Reject immediately with a 401 Unauthorized status if the token cookie is missing
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized. Authentication token missing.' });
    }

    try {
        // Decode and verify the cryptographic signature of the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find matching user profile inside MongoDB, omitting password hash to maintain strict data sanitization
        req.user = await User.findById(decoded.userId).select('-password');
        
        // Fail if the user record corresponding to the JWT has been deleted or blocked
        if (!req.user) {
            return res.status(401).json({ message: 'User session invalid. Account not found.' });
        }
        
        // Successfully verified, trigger express router's next middleware/controller handler
        next();
    } catch (error) {
        // Reject request if JWT verification throws a token expired or corrupted signature error
        return res.status(401).json({ message: 'Unauthorized. Access token has expired or is invalid.' });
    }
};
