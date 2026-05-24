import { create } from 'zustand';

/**
 * Zustand visual theme coordinator store.
 * Manages light and dark mode preferences, serializes choices directly to browser storage
 * to persist across sessions, and directly manipulates the document body DOM classes
 * to trigger cascading vanilla CSS aesthetic changes.
 * 
 * @module useThemeStore
 */
const useThemeStore = create((set) => ({
    // ---- Store State Fields ----

    // The active theme string. Defaults to fetching from persistent LocalStorage if available.
    // If not, uses 'dark' as the sleek default fallback.
    theme: localStorage.getItem('theme') || 'dark', 
    
    // ---- Store Action Methods ----

    /**
     * Theme Toggle Method.
     * Reverses the currently active visual mode.
     * Serializes the new preference to browser localStorage immediately.
     */
    toggleTheme: () => set((state) => {
        // Calculate the inverse of the current state
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        
        // Persist choice to user's local machine
        localStorage.setItem('theme', nextTheme);
        
        // Sync body stylesheet classes for vanilla CSS overrides
        // Adds a '.light-mode' class to the <body> element so nested elements can adopt alternative color variables
        if (nextTheme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            // Remove the class to revert the body back to the default dark aesthetic
            document.body.classList.remove('light-mode');
        }
        
        // Update the Zustand state
        return { theme: nextTheme };
    }),
    
    /**
     * Application Bootstrap Theme Hook.
     * Read the user's cached visual theme on initial mount and apply corresponding CSS classes.
     * Prevents "flash of un-themed content" (FOUC).
     */
    initTheme: () => {
        // Fetch saved theme safely
        const saved = localStorage.getItem('theme') || 'dark';
        
        // Apply class manipulation exactly like the toggle mechanic
        if (saved === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
        
        // Initialize state
        set({ theme: saved });
    }
}));

export default useThemeStore;
