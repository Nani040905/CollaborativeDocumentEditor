import { create } from 'zustand';

/**
 * Zustand visual theme coordinator store.
 * Manages light and dark mode preferences, serializes choices directly to browser storage
 * and updates document DOM list tags.
 */
const useThemeStore = create((set) => ({
    theme: localStorage.getItem('theme') || 'dark', // Defaults to sleek dark mode
    
    /**
     * Toggles between light and dark modes.
     * Serializes preference to localStorage and updates document body styles.
     */
    toggleTheme: () => set((state) => {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', nextTheme);
        
        // Sync body stylesheet classes for vanilla CSS overrides
        if (nextTheme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
        
        return { theme: nextTheme };
    }),
    
    /**
     * Bootstraps user's cached visual theme on mount.
     */
    initTheme: () => {
        const saved = localStorage.getItem('theme') || 'dark';
        if (saved === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
        set({ theme: saved });
    }
}));

export default useThemeStore;
