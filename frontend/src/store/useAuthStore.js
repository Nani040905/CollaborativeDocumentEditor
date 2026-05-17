import { create } from 'zustand';

// Simple mockup auth store to allow interactive navigation & local testing during shell setup
const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('mock_user')) || null,
    isAuthenticated: !!localStorage.getItem('mock_user'),
    loading: false,
    error: null,

    checkAuth: () => {
        // Simple synchronous check
        const user = localStorage.getItem('mock_user');
        if (user) {
            set({ user: JSON.parse(user), isAuthenticated: true, loading: false });
        } else {
            set({ user: null, isAuthenticated: false, loading: false });
        }
    },

    login: async (email, password) => {
        set({ loading: true, error: null });
        // Simulating minor network latency
        await new Promise((resolve) => setTimeout(resolve, 600));

        if (!email || !password) {
            set({ error: 'Please enter both email and password.', loading: false });
            return { success: false, error: 'Please enter both email and password.' };
        }

        const mockUser = { id: 'usr_mock_1', name: email.split('@')[0], email };
        localStorage.setItem('mock_user', JSON.stringify(mockUser));
        set({ user: mockUser, isAuthenticated: true, loading: false });
        return { success: true };
    },

    register: async (name, email, password) => {
        set({ loading: true, error: null });
        await new Promise((resolve) => setTimeout(resolve, 600));

        if (!name || !email || !password) {
            set({ error: 'Please fill in all registration fields.', loading: false });
            return { success: false, error: 'Please fill in all registration fields.' };
        }

        const mockUser = { id: 'usr_mock_1', name, email };
        localStorage.setItem('mock_user', JSON.stringify(mockUser));
        set({ user: mockUser, isAuthenticated: true, loading: false });
        return { success: true };
    },

    logout: async () => {
        set({ loading: true });
        await new Promise((resolve) => setTimeout(resolve, 300));
        localStorage.removeItem('mock_user');
        set({ user: null, isAuthenticated: false, loading: false });
    },

    clearErrors: () => set({ error: null })
}));

export default useAuthStore;
