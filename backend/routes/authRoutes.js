import express from 'express';
import { registerUser, loginUser, logoutUser, checkAuth, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

// Initialize an Express router instance for auth-related endpoints
const router = express.Router();

// ==========================================
// Public Routes: No Authentication Required
// ==========================================

/**
 * @route POST /api/auth/register
 * @desc Registers a new user with name, email, and password
 * @access Public
 */
router.post('/register', registerUser);

/**
 * @route POST /api/auth/login
 * @desc Authenticates a user and issues an HTTP-only JWT cookie
 * @access Public
 */
router.post('/login', loginUser);

/**
 * @route POST /api/auth/logout
 * @desc Clears the active session by invalidating the JWT cookie
 * @access Public
 */
router.post('/logout', logoutUser);

// ==========================================
// Secure Routes: Require Active JWT Token
// ==========================================

/**
 * @route GET /api/auth/me
 * @desc Retrieves the currently authenticated user's profile data
 * @access Private (Requires `protect` middleware)
 */
router.get('/me', protect, checkAuth);

/**
 * @route PUT /api/auth/profile
 * @desc Updates the authenticated user's profile settings (e.g., name, password)
 * @access Private (Requires `protect` middleware)
 */
router.put('/profile', protect, updateProfile);

export default router;
