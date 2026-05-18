import User from '../models/User.js';
import jwt from 'jsonwebtoken';

/**
 * Helper utility to sign a JSON Web Token (JWT) and dispatch it as an HTTP-only cookie.
 * @param {object} res - Express response handler object.
 * @param {string} userId - User document Object ID from MongoDB.
 */
const sendTokenCookie = (res, userId) => {
    // Encodes the target user identifier within the token payload, valid for 7 days
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });

    // Mount the cookie on the response payload
    res.cookie('token', token, {
        httpOnly: true, // Firewalls the cookie from client-side script read attempts (XSS protection)
        secure: process.env.NODE_ENV === 'production', // Instructs the browser to only transmit cookies via HTTPS when in production
        sameSite: 'lax', // CSRF setting restricting cross-site cookie transmissions
        maxAge: 7 * 24 * 60 * 60 * 1000 // Lifespan set to 7 days matching the JWT expiration
    });
};

/**
 * Registers a brand-new user profile in the database.
 * Verifies email uniqueness, hashes form password, creates profile, and issues auth cookies.
 */
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Assert that the email address is not already claimed
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }

        // Create the user record (pre-save hook hashes the plain-text password)
        const user = await User.create({ name, email, password });
        
        // Dispatch session token cookie automatically on successful registration
        sendTokenCookie(res, user._id);

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: `Registration error: ${error.message}` });
    }
};

/**
 * Authenticates a returning user based on password crypt matching.
 * Dispatches session token cookies upon successful verification.
 */
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Lookup the user by their email address
        const user = await User.findOne({ email });
        
        // Match submitted credentials against our database hash
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials. Check your email or password.' });
        }

        // Dispatch verification token cookie to client
        sendTokenCookie(res, user._id);

        res.status(200).json({
            message: 'Login successful',
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: `Login error: ${error.message}` });
    }
};

/**
 * Session verification route handler.
 * Runs after `protect` middleware to return active session parameters to the client.
 */
export const checkAuth = async (req, res) => {
    // req.user has already been resolved by our auth middleware
    res.status(200).json({
        isAuthenticated: true,
        user: { id: req.user._id, name: req.user.name, email: req.user.email }
    });
};

/**
 * Purges active token cookies to securely terminate client sessions.
 */
export const logoutUser = (req, res) => {
    // Purges the cookie immediately by setting its expiration date to the epoch start
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0), // Instantly expire cookie
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    });
    res.status(200).json({ message: 'Logged out successfully.' });
};

/**
 * Updates the display name inside the active user's document record.
 */
export const updateProfile = async (req, res) => {
    try {
        // Fetch target user from MongoDB
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Apply visual and string-trim cleans prior to saving
        if (req.body.name) {
            user.name = req.body.name.trim();
        }

        // Commit changes back to MongoDB
        await user.save();
        res.status(200).json({
            message: 'Profile updated successfully',
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: `Profile update error: ${error.message}` });
    }
};
