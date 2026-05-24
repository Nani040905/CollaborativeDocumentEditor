import React from 'react';
import { 
    FolderOpen, Users, Settings, Trash2, LogOut 
} from 'lucide-react';

/**
 * Dashboard Sidebar Component.
 * Manages the main navigation tabs between documents, shared sheets, settings, and trash.
 */
const DashboardSidebar = ({ activeTab, setActiveTab, user, handleLogout }) => {
    return (
        <aside className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col justify-between select-none">
            <div>
                {/* Header Logo */}
                <div className="p-6 border-b border-slate-800 flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded text-white font-bold text-sm tracking-widest font-display">
                        CDE
                    </div>
                    <span className="font-semibold text-slate-100 font-display tracking-wider">COLLAB EDIT</span>
                </div>

                {/* Navigation list */}
                <nav className="p-4 space-y-1">
                    <button 
                        onClick={() => setActiveTab('documents')}
                        className={`flex w-full items-center gap-3 px-3 py-2 text-xs font-semibold rounded cursor-pointer transition ${
                            activeTab === 'documents'
                                ? 'text-slate-200 bg-slate-800'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                        }`}
                    >
                        <FolderOpen size={16} className={activeTab === 'documents' ? 'text-blue-500' : ''} />
                        <span>All Documents</span>
                    </button>

                    <button 
                        onClick={() => setActiveTab('shared')}
                        className={`flex w-full items-center gap-3 px-3 py-2 text-xs font-semibold rounded cursor-pointer transition ${
                            activeTab === 'shared'
                                ? 'text-slate-200 bg-slate-800'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                        }`}
                    >
                        <Users size={16} className={activeTab === 'shared' ? 'text-purple-500' : ''} />
                        <span>Shared with Me</span>
                    </button>

                    <button 
                        onClick={() => setActiveTab('settings')}
                        className={`flex w-full items-center gap-3 px-3 py-2 text-xs font-semibold rounded cursor-pointer transition ${
                            activeTab === 'settings'
                                ? 'text-slate-200 bg-slate-800'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                        }`}
                    >
                        <Settings size={16} className={activeTab === 'settings' ? 'text-emerald-500' : ''} />
                        <span>Settings</span>
                    </button>

                    <button 
                        onClick={() => setActiveTab('trash')}
                        className={`flex w-full items-center gap-3 px-3 py-2 text-xs font-semibold rounded cursor-pointer transition ${
                            activeTab === 'trash'
                                ? 'text-slate-200 bg-slate-800'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                        }`}
                    >
                        <Trash2 size={16} className={activeTab === 'trash' ? 'text-red-500' : ''} />
                        <span>Trash</span>
                    </button>
                </nav>
            </div>

            {/* Profile Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-8 w-8 min-w-8 flex items-center justify-center rounded bg-slate-800 text-xs font-bold text-slate-300">
                        {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Mern User'}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user?.email || 'mern@example.com'}</p>
                    </div>
                </div>
                <button 
                    onClick={handleLogout}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded hover:bg-slate-800 cursor-pointer transition"
                    title="Sign Out"
                >
                    <LogOut size={16} />
                </button>
            </div>
        </aside>
    );
};

export default DashboardSidebar;
