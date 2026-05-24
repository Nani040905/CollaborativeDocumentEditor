import { create } from 'zustand';
import { authService } from '../services/authService';

const useAuthStore = create((set) => ({
    user: null,              
    isAuthenticated: false,   
    loading: true,            
    error: null,              

    checkAuth: async () => {
        set({ loading: true, error: null });
        try {
            const res = await authService.checkAuth();
            set({ user: res.data.user, isAuthenticated: true, loading: false });
        } catch (err) {
            set({ user: null, isAuthenticated: false, loading: false });
        }
    },

    register: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
            const res = await authService.register(name, email, password);
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
            const res = await authService.login(email, password);
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
            await authService.logout();
            set({ user: null, isAuthenticated: false, loading: false });
        } catch (err) {
            set({ error: 'Failed to logout correctly.', loading: false });
        }
    },

    updateProfile: async (name) => {
        set({ loading: true, error: null });
        try {
            const res = await authService.updateProfile(name);
            set({ user: res.data.user, loading: false });
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || 'Profile update failed';
            set({ error: msg, loading: false });
            return { success: false, error: msg };
        }
    },

    clearErrors: () => set({ error: null })
}));

export default useAuthStore;
