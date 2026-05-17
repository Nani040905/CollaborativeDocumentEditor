import { create } from 'zustand';

const useThemeStore = create((set) => ({
    theme: localStorage.getItem('theme') || 'dark', // 'dark' or 'light'
    
    toggleTheme: () => set((state) => {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', nextTheme);
        
        // Sync class on document.body
        if (nextTheme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
        
        return { theme: nextTheme };
    }),
    
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
