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
