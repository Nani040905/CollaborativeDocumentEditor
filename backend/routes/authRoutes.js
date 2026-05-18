import express from 'express';
import { registerUser, loginUser, logoutUser, checkAuth, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes: Allow registration and login attempts freely
router.post('/register', registerUser);
router.post('/login', loginUser);

// Session Termination Route
router.post('/logout', logoutUser);

// Secure Routes: Restrict session validation and profile updates behind JWT auth verification middleware
router.get('/me', protect, checkAuth);
router.put('/profile', protect, updateProfile);

export default router;
