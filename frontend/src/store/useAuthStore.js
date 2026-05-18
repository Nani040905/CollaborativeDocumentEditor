import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Pass credentials and session cookies automatically with every request
axios.defaults.withCredentials = true;

/**
 * Zustand global authentication store.
 * Manages active user sessions, token verification checks, registrations, login forms,
 * profile update dispatchers, and handles clean state loading/error parameters.
 */
const useAuthStore = create((set) => ({
    user: null,              // Active logged-in user profile object
    isAuthenticated: false,   // Flag signaling verified session state
    loading: true,            // Loading state indicator
    error: null,              // Handles error feedback strings

    /**
     * Handshakes with MERN server to verify active session cookie.
     * Invoked on application initial mount.
     */
    checkAuth: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axios.get(`${API_URL}/auth/me`);
            // Session validated successfully
            set({ user: res.data.user, isAuthenticated: true, loading: false });
        } catch (err) {
            // Discard session states on verification failures (expired or missing cookies)
            set({ user: null, isAuthenticated: false, loading: false });
        }
    },

    /**
     * Registers a new user account.
     * @param {string} name - Display Name
     * @param {string} email - Registered Email
     * @param {string} password - Password String
     * @returns {Promise<{success: boolean, error?: string}>} Dispatch results.
     */
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

    /**
     * Authenticates an existing user account.
     * @param {string} email - User Login Email
     * @param {string} password - User Password
     * @returns {Promise<{success: boolean, error?: string}>} Dispatch results.
     */
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

    /**
     * Clears active cookie tokens to terminate user sessions.
     */
    logout: async () => {
        set({ loading: true, error: null });
        try {
            await axios.post(`${API_URL}/auth/logout`);
            // Reset active auth states
            set({ user: null, isAuthenticated: false, loading: false });
        } catch (err) {
            set({ error: 'Failed to logout correctly.', loading: false });
        }
    },

    /**
     * Submits name modifications back to MongoDB auth collections.
     * @param {string} name - New display name input.
     * @returns {Promise<{success: boolean, error?: string}>} Update results.
     */
    updateProfile: async (name) => {
        set({ loading: true, error: null });
        try {
            const res = await axios.put(`${API_URL}/auth/profile`, { name });
            set({ user: res.data.user, loading: false });
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || 'Profile update failed';
            set({ error: msg, loading: false });
            return { success: false, error: msg };
        }
    },

    // Resets active form/api error statuses
    clearErrors: () => set({ error: null })
}));

export default useAuthStore;
