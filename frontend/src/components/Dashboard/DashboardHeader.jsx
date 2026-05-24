import React from 'react';
import { Search, Moon, Sun, Plus, Trash2 } from 'lucide-react';

/**
 * Dashboard Header Component.
 * Provides the global search bar, visual theme toggles, and document creation actions.
 */
const DashboardHeader = ({ 
    activeTab, 
    searchQuery, 
    setSearchQuery, 
    theme, 
    toggleTheme, 
    setShowModal, 
    trashCount, 
    handleEmptyTrash 
}) => {
    // Determine the search input placeholder dynamically
    const getPlaceholderText = () => {
        if (activeTab === 'documents') return 'Search in all documents...';
        if (activeTab === 'shared') return 'Search in shared sheets...';
        if (activeTab === 'trash') return 'Search in trash bin...';
        return 'Search...';
    };

    return (
        <header className="h-16 border-b border-slate-800 px-8 flex items-center justify-between min-h-16">
            <div className="relative w-80">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Search size={15} />
                </span>
                <input
                    type="text"
                    placeholder={getPlaceholderText()}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded border border-slate-800 bg-slate-900/60 py-1.5 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-600 outline-none transition focus:border-slate-700 focus:bg-slate-900"
                />
            </div>

            <div className="flex items-center gap-3">
                {/* Theme Toggle Switch */}
                <button
                    onClick={toggleTheme}
                    className="flex items-center justify-center p-2 rounded border border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 transition cursor-pointer select-none"
                    title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                >
                    {theme === 'dark' ? <Moon size={13} className="text-blue-400" /> : <Sun size={13} className="text-yellow-500" />}
                </button>

                {activeTab === 'documents' && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-1.5 rounded bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 cursor-pointer"
                    >
                        <Plus size={14} />
                        <span>New Document</span>
                    </button>
                )}

                {activeTab === 'trash' && trashCount > 0 && (
                    <button
                        onClick={handleEmptyTrash}
                        className="flex items-center gap-1.5 rounded border border-slate-800 bg-slate-900 hover:bg-red-950/40 hover:text-red-400 px-4 py-2 text-xs font-semibold text-slate-400 transition cursor-pointer"
                    >
                        <Trash2 size={13} />
                        <span>Empty Trash Bin</span>
                    </button>
                )}
            </div>
        </header>
    );
};

export default DashboardHeader;
