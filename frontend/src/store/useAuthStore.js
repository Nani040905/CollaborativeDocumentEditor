import { create } from 'zustand';
import axios from 'axios';

// Resolve backend API URL from Vite environment variables or fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Globally configure Axios to send and receive HTTP-only cookies securely across domains
// Essential for the JWT session mechanism to work properly
axios.defaults.withCredentials = true;

/**
 * Zustand global authentication store.
 * Manages active user sessions, token verification checks, registrations, login forms,
 * profile update dispatchers, and handles clean state loading/error parameters.
 * 
 * @module useAuthStore
 */
const useAuthStore = create((set) => ({
    // ---- Store State Fields ----
    
    // The currently active user object containing id, name, and email
    user: null,              
    // Boolean flag determining if the user has a valid authenticated session
    isAuthenticated: false,   
    // Boolean flag indicating if an async authentication operation is currently resolving
    loading: true,            
    // String message representing the most recent error from an auth operation
    error: null,              

    // ---- Store Action Methods ----

    /**
     * Session Handshake Method
     * Handshakes with MERN server to verify active session HTTP-only cookie.
     * Invoked on application initial mount (in App.jsx) to restore returning users.
     */
    checkAuth: async () => {
        // Reset state before flight
        set({ loading: true, error: null });
        try {
            // Attempt to hit the secure `/auth/me` endpoint
            const res = await axios.get(`${API_URL}/auth/me`);
            // If successful, the server validated the cookie. Save the user profile to state.
            set({ user: res.data.user, isAuthenticated: true, loading: false });
        } catch (err) {
            // Discard session states on verification failures (e.g. expired or missing cookies)
            // Does not populate `error` here because it's an expected failure for logged-out users
            set({ user: null, isAuthenticated: false, loading: false });
        }
    },

    /**
     * Account Registration Method
     * Registers a new user account via the Express backend.
     * 
     * @param {string} name - Display Name
     * @param {string} email - Registered Email
     * @param {string} password - Password String
     * @returns {Promise<{success: boolean, error?: string}>} Dispatch results.
     */
    register: async (name, email, password) => {
        // Trigger loading spinner in UI forms
        set({ loading: true, error: null });
        try {
            // Send payload to backend
            const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
            // The backend returns the new user profile AND automatically sets the HTTP-only cookie
            set({ user: res.data.user, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (err) {
            // Safely extract error message from Axios response or fallback to generic text
            const msg = err.response?.data?.message || 'Registration failed';
            // Save error to global state so UI components can render it
            set({ error: msg, loading: false });
            return { success: false, error: msg };
        }
    },

    /**
     * Account Login Method
     * Authenticates an existing user account via email and password.
     * 
     * @param {string} email - User Login Email
     * @param {string} password - User Password
     * @returns {Promise<{success: boolean, error?: string}>} Dispatch results.
     */
    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });
            // The backend automatically sets the HTTP-only cookie on successful login
            set({ user: res.data.user, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (err) {
            // Safely extract rejection reason (e.g. "Invalid credentials")
            const msg = err.response?.data?.message || 'Login credentials incorrect';
            set({ error: msg, loading: false });
            return { success: false, error: msg };
        }
    },

    /**
     * Session Termination Method
     * Clears active cookie tokens to terminate user sessions securely on the server-side.
     */
    logout: async () => {
        set({ loading: true, error: null });
        try {
            // Ask server to invalidate/clear the HTTP-only cookie
            await axios.post(`${API_URL}/auth/logout`);
            // Flush all sensitive user data from the local client state
            set({ user: null, isAuthenticated: false, loading: false });
        } catch (err) {
            set({ error: 'Failed to logout correctly.', loading: false });
        }
    },

    /**
     * Profile Modification Method
     * Submits display name modifications back to MongoDB auth collections.
     * 
     * @param {string} name - New display name input.
     * @returns {Promise<{success: boolean, error?: string}>} Update results.
     */
    updateProfile: async (name) => {
        set({ loading: true, error: null });
        try {
            const res = await axios.put(`${API_URL}/auth/profile`, { name });
            // Update the local user profile object with the new data from the server
            set({ user: res.data.user, loading: false });
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || 'Profile update failed';
            set({ error: msg, loading: false });
            return { success: false, error: msg };
        }
    },

    /**
     * Error Flush Method
     * Resets active form/api error statuses in the store. 
     * Typically called immediately before attempting a new form submission.
     */
    clearErrors: () => set({ error: null })
}));

export default useAuthStore;
