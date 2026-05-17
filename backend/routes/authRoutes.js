import express from 'express';
import { registerUser, loginUser, logoutUser, checkAuth, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, checkAuth);
router.put('/profile', protect, updateProfile);

export default router;
