# Part 4: User Authentication (JWT & Cookies)

In this guide, you will build a highly secure, state-of-the-art authentication system. We will configure password hashing on the backend, structure token storage in signed HTTP-Only cookies, build custom verification middleware, and map this to a powerful Zustand auth store on the client side.

---

## 1. Backend Authentication Logic

### Creating Authenticated Route Firewall (`middleware/authMiddleware.js`)
Create the file `backend/middleware/authMiddleware.js` to protect routes:

```javascript
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
```

### Implementing Authentication Controllers (`controllers/authController.js`)
Create `backend/controllers/authController.js` to handle signups, logins, check session states, and logouts:

```javascript
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Cookie helper
const sendTokenCookie = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('token', token, {
        httpOnly: true, // Prevents XSS script read attacks
        secure: isProd, // Only HTTPS in production
        sameSite: isProd ? 'none' : 'lax', // 'none' needed for cross-origin cookies (Vercel to Render)
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days matching token
        partitioned: isProd
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
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0), // Instantly purge cookie
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd,
        partitioned: isProd
    });
    res.status(200).json({ message: 'Logged out successfully.' });
};
```

### Mapping Routes (`routes/authRoutes.js`)
Replace `backend/routes/authRoutes.js` with the clean modular mappings:

```javascript
import express from 'express';
import { registerUser, loginUser, logoutUser, checkAuth } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, checkAuth);

export default router;
```

> [!TIP]
> Ensure you import this router inside your main `server.js` and mount it:
> `app.use('/api/auth', authRoutes);`

---

## 2. Frontend Authentication Store (Zustand)

Using Zustand for authorization is ideal because it acts as a global context, immediately providing user state changes to routing wrappers without triggering unnecessary parent re-renders.

### Creating Zustand Auth Manager (`frontend/src/store/useAuthStore.js`)
Create the file `frontend/src/store/useAuthStore.js` and input the following configuration:

```javascript
import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Pass cookies automatically with every request
axios.defaults.withCredentials = true;

const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,

    checkAuth: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axios.get(`${API_URL}/auth/me`);
            set({ user: res.data.user, isAuthenticated: true, loading: false });
        } catch (err) {
            set({ user: null, isAuthenticated: false, loading: false });
        }
    },

    register: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
            const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
            set({ user: res.data.user, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed';
            set({ error: msg, loading: false });
            return { success: false, error: msg };
        }
    },

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });
            set({ user: res.data.user, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || 'Login credentials incorrect';
            set({ error: msg, loading: false });
            return { success: false, error: msg };
        }
    },

    logout: async () => {
        set({ loading: true, error: null });
        try {
            await axios.post(`${API_URL}/auth/logout`);
            set({ user: null, isAuthenticated: false, loading: false });
        } catch (err) {
            set({ error: 'Failed to logout correctly.', loading: false });
        }
    },

    clearErrors: () => set({ error: null })
}));

export default useAuthStore;
```

This completes your bulletproof session management and user authentication system! Next, we will design our robust Document and User databases.
