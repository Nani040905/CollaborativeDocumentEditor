import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Cookie helper
const sendTokenCookie = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });

    res.cookie('token', token, {
        httpOnly: true, // Prevents XSS script read attacks
        secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
        sameSite: 'lax', // CSRF mitigation setting
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days matching token
    });
};

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }

        const user = await User.create({ name, email, password });
        sendTokenCookie(res, user._id);

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: `Registration error: ${error.message}` });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials. Check your email or password.' });
        }

        sendTokenCookie(res, user._id);

        res.status(200).json({
            message: 'Login successful',
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: `Login error: ${error.message}` });
    }
};

export const checkAuth = async (req, res) => {
    // req.user has already been resolved by our auth middleware
    res.status(200).json({
        isAuthenticated: true,
        user: { id: req.user._id, name: req.user.name, email: req.user.email }
    });
};

export const logoutUser = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0), // Instantly purge cookie
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    });
    res.status(200).json({ message: 'Logged out successfully.' });
};

export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (req.body.name) {
            user.name = req.body.name.trim();
        }

        await user.save();
        res.status(200).json({
            message: 'Profile updated successfully',
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: `Profile update error: ${error.message}` });
    }
};
