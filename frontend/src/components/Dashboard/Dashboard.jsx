import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import useAuthStore from '../../store/useAuthStore';
import { 
    FileText, Plus, Search, LogOut, Trash2, 
    Settings, Users, FolderOpen, Calendar, X,
    RotateCcw, Shield, ShieldAlert, Monitor, CheckCircle, Save
} from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    
    // Core navigation state
    const [activeTab, setActiveTab] = useState('documents');
    
    // Search queries
    const [searchQuery, setSearchQuery] = useState('');
    
    // Document collections
    const [documents, setDocuments] = useState([]);
    const [sharedDocuments, setSharedDocuments] = useState([]);
    const [trashDocuments, setTrashDocuments] = useState([]);
    
    // Modal & creation states
    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newTemplate, setNewTemplate] = useState('blank');
    
    // Settings feedback states
    const [settingsSaved, setSettingsSaved] = useState(false);
    const [settingsName, setSettingsName] = useState('');
    const [settingsTheme, setSettingsTheme] = useState('deep-obsidian');
    const [enableAutosave, setEnableAutosave] = useState(true);
    const [presenceBubbles, setPresenceBubbles] = useState(true);

    // Initial mock document fixtures
    const defaultDocs = [
        { id: 'doc-1', title: 'Product Roadmap & Strategy 2026', updatedAt: '2 hours ago', ownerInitials: 'JD', shares: 3, content: 'This is the strategic roadmap for the upcoming product lifecycle...' },
        { id: 'doc-2', title: 'Weekly Engineering Sync Notes', updatedAt: 'Yesterday', ownerInitials: 'SK', shares: 1, content: 'Discussed task status and frontend routing setup with Tailwind CSS v4...' },
        { id: 'doc-3', title: 'MERN Stack Architecture Spec', updatedAt: '3 days ago', ownerInitials: 'JD', shares: 5, content: 'Architectural breakdown of backend JWT authentications and socket connections...' }
    ];

    const defaultShared = [
        { id: 'shared-1', title: 'Q3 Product Operations & KPI Planning', updatedAt: '5 mins ago', ownerInitials: 'TC', shares: 8, content: 'Collaborative spreadsheet outlining department metrics and growth targets...' },
        { id: 'shared-2', title: 'Developer Relations Guidelines', updatedAt: '2 days ago', ownerInitials: 'HR', shares: 4, content: 'Standard operating procedures for managing open-source contributor channels...' }
    ];

    const defaultTrash = [];

    // Load initial states from LocalStorage or seed defaults
    useEffect(() => {
        if (user?.name) {
            setSettingsName(user.name);
        }

        const storedDocs = localStorage.getItem('mock_documents');
        if (storedDocs) {
            setDocuments(JSON.parse(storedDocs));
        } else {
            localStorage.setItem('mock_documents', JSON.stringify(defaultDocs));
            setDocuments(defaultDocs);
        }

        const storedShared = localStorage.getItem('mock_shared');
        if (storedShared) {
            setSharedDocuments(JSON.parse(storedShared));
        } else {
            localStorage.setItem('mock_shared', JSON.stringify(defaultShared));
            setSharedDocuments(defaultShared);
        }

        const storedTrash = localStorage.getItem('mock_trash');
        if (storedTrash) {
            setTrashDocuments(JSON.parse(storedTrash));
        } else {
            localStorage.setItem('mock_trash', JSON.stringify(defaultTrash));
            setTrashDocuments(defaultTrash);
        }
    }, [user]);

    // Handlers
    const handleCreateDocument = (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        const newDoc = {
            id: 'doc-' + Date.now(),
            title: newTitle.trim(),
            updatedAt: 'Just now',
            ownerInitials: user?.name ? user.name.substring(0, 2).toUpperCase() : 'ME',
            shares: 0,
            content: newTemplate === 'code' ? '// Write your code spec here' : 'Start typing your collaborative document contents here...'
        };

        const updatedDocs = [newDoc, ...documents];
        setDocuments(updatedDocs);
        localStorage.setItem('mock_documents', JSON.stringify(updatedDocs));
        
        setShowModal(false);
        setNewTitle('');
        setNewTemplate('blank');

        // Instantly navigate to the newly created document!
        navigate(`/document/${newDoc.id}`);
    };

    // Move to Trash handler
    const handleMoveToTrash = (e, id) => {
        e.stopPropagation();
        const docToTrash = documents.find(doc => doc.id === id);
        if (!docToTrash) return;

        const updatedDocs = documents.filter(doc => doc.id !== id);
        setDocuments(updatedDocs);
        localStorage.setItem('mock_documents', JSON.stringify(updatedDocs));

        const updatedTrash = [docToTrash, ...trashDocuments];
        setTrashDocuments(updatedTrash);
        localStorage.setItem('mock_trash', JSON.stringify(updatedTrash));
    };

    // Restore from Trash handler
    const handleRestoreFromTrash = (e, id) => {
        e.stopPropagation();
        const docToRestore = trashDocuments.find(doc => doc.id === id);
        if (!docToRestore) return;

        const updatedTrash = trashDocuments.filter(doc => doc.id !== id);
        setTrashDocuments(updatedTrash);
        localStorage.setItem('mock_trash', JSON.stringify(updatedTrash));

        const updatedDocs = [docToRestore, ...documents];
        setDocuments(updatedDocs);
        localStorage.setItem('mock_documents', JSON.stringify(updatedDocs));
    };

    // Permanent delete handler
    const handlePermanentDelete = (e, id) => {
        e.stopPropagation();
        const updatedTrash = trashDocuments.filter(doc => doc.id !== id);
        setTrashDocuments(updatedTrash);
        localStorage.setItem('mock_trash', JSON.stringify(updatedTrash));
    };

    // Empty Trash handler
    const handleEmptyTrash = () => {
        setTrashDocuments([]);
        localStorage.setItem('mock_trash', JSON.stringify([]));
    };

    const handleSaveSettings = (e) => {
        e.preventDefault();
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Filter selectors
    const getFilteredDocs = () => {
        if (activeTab === 'documents') {
            return documents.filter(doc => 
                doc.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        } else if (activeTab === 'shared') {
            return sharedDocuments.filter(doc => 
                doc.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        } else if (activeTab === 'trash') {
            return trashDocuments.filter(doc => 
                doc.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return [];
    };

    const activeList = getFilteredDocs();

    return (
        <div className="flex h-screen w-screen bg-slate-950 text-slate-200">
            {/* Sidebar */}
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
                            onClick={() => { setActiveTab('documents'); setSearchQuery(''); }}
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
                            onClick={() => { setActiveTab('shared'); setSearchQuery(''); }}
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
                            onClick={() => { setActiveTab('settings'); setSearchQuery(''); }}
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
                            onClick={() => { setActiveTab('trash'); setSearchQuery(''); }}
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

            {/* Main Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                
                {/* Conditionally Render Search Header */}
                {activeTab !== 'settings' && (
                    <header className="h-16 border-b border-slate-800 px-8 flex items-center justify-between min-h-16">
                        <div className="relative w-80">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                                <Search size={15} />
                            </span>
                            <input
                                type="text"
                                placeholder={`Search in ${activeTab === 'documents' ? 'all documents' : activeTab === 'shared' ? 'shared sheets' : 'trash bin'}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded border border-slate-800 bg-slate-900/60 py-1.5 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-600 outline-none transition focus:border-slate-700 focus:bg-slate-900"
                            />
                        </div>

                        {activeTab === 'documents' && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-1.5 rounded bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 cursor-pointer"
                            >
                                <Plus size={14} />
                                <span>New Document</span>
                            </button>
                        )}

                        {activeTab === 'trash' && trashDocuments.length > 0 && (
                            <button
                                onClick={handleEmptyTrash}
                                className="flex items-center gap-1.5 rounded border border-slate-800 bg-slate-900 hover:bg-red-950/40 hover:text-red-400 px-4 py-2 text-xs font-semibold text-slate-400 transition cursor-pointer"
                            >
                                <Trash2 size={13} />
                                <span>Empty Trash Bin</span>
                            </button>
                        )}
                    </header>
                )}

                {/* Main Views Container */}
                <div className="flex-1 overflow-y-auto p-8">
                    
                    {/* View 1: Active Documents Grid */}
                    {activeTab === 'documents' && (
                        <>
                            <div className="mb-6">
                                <h1 className="text-xl font-bold tracking-tight text-slate-100 font-display">Documents</h1>
                                <p className="text-xs text-slate-500 mt-1">Access your clean MERN collaborative notebooks</p>
                            </div>

                            {activeList.length === 0 ? (
                                <div className="flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-lg p-16 text-center">
                                    <FileText size={40} className="text-slate-600 mb-3" />
                                    <h3 className="text-sm font-semibold text-slate-300">No documents found</h3>
                                    <p className="text-xs text-slate-500 mt-1">Create a new collaborative sheet to get started.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {activeList.map((doc) => (
                                        <div
                                            key={doc.id}
                                            onClick={() => navigate(`/document/${doc.id}`)}
                                            className="border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-700 rounded-lg p-5 transition flex flex-col justify-between h-40 cursor-pointer shadow-sm group"
                                        >
                                            <div>
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <FileText size={16} className="text-blue-500" />
                                                        <h3 className="text-xs font-semibold text-slate-200 line-clamp-1 group-hover:text-blue-400 transition">
                                                            {doc.title}
                                                        </h3>
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleMoveToTrash(e, doc.id)}
                                                        className="p-1 text-slate-600 hover:text-red-400 hover:bg-slate-800 rounded transition cursor-pointer"
                                                        title="Move to Trash"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                                <p className="mt-2 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                                    {doc.content}
                                                </p>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={11} />
                                                    <span>{doc.updatedAt}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {doc.shares > 0 && (
                                                        <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-medium">
                                                            {doc.shares} shares
                                                        </span>
                                                    )}
                                                    <div className="h-5 w-5 flex items-center justify-center rounded-full bg-slate-800 text-[8px] font-bold text-slate-400" title={`Owner: ${doc.ownerInitials}`}>
                                                        {doc.ownerInitials}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* View 2: Shared with Me Grid */}
                    {activeTab === 'shared' && (
                        <>
                            <div className="mb-6">
                                <h1 className="text-xl font-bold tracking-tight text-slate-100 font-display">Shared with Me</h1>
                                <p className="text-xs text-slate-500 mt-1">Sheets shared with you by other active team members</p>
                            </div>

                            {activeList.length === 0 ? (
                                <div className="flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-lg p-16 text-center">
                                    <Users size={40} className="text-slate-600 mb-3" />
                                    <h3 className="text-sm font-semibold text-slate-300">No shared documents</h3>
                                    <p className="text-xs text-slate-500 mt-1">Shared notebooks will display here automatically.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {activeList.map((doc) => (
                                        <div
                                            key={doc.id}
                                            onClick={() => navigate(`/document/${doc.id}`)}
                                            className="border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-700 rounded-lg p-5 transition flex flex-col justify-between h-40 cursor-pointer shadow-sm group"
                                        >
                                            <div>
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <FileText size={16} className="text-purple-500" />
                                                        <h3 className="text-xs font-semibold text-slate-200 line-clamp-1 group-hover:text-purple-450 transition">
                                                            {doc.title}
                                                        </h3>
                                                    </div>
                                                    <span className="text-[9px] uppercase tracking-wider font-semibold text-purple-400 bg-purple-950/40 px-1.5 py-0.5 rounded">
                                                        Collaborator
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                                    {doc.content}
                                                </p>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={11} />
                                                    <span>{doc.updatedAt}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-medium">
                                                        {doc.shares} shares
                                                    </span>
                                                    <div className="h-5 w-5 flex items-center justify-center rounded-full bg-purple-900 text-[8px] font-bold text-purple-300" title={`Owner initials: ${doc.ownerInitials}`}>
                                                        {doc.ownerInitials}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* View 3: Trash Grid */}
                    {activeTab === 'trash' && (
                        <>
                            <div className="mb-6">
                                <h1 className="text-xl font-bold tracking-tight text-slate-100 font-display">Trash Bin</h1>
                                <p className="text-xs text-slate-500 mt-1">Review, restore, or permanently delete items from your workspace</p>
                            </div>

                            {activeList.length === 0 ? (
                                <div className="flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-lg p-16 text-center">
                                    <Trash2 size={40} className="text-slate-600 mb-3" />
                                    <h3 className="text-sm font-semibold text-slate-300">Trash bin is empty</h3>
                                    <p className="text-xs text-slate-500 mt-1">Documents you delete will show up here.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {activeList.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="border border-slate-850 bg-slate-950/20 rounded-lg p-5 flex flex-col justify-between h-40 shadow-sm relative group"
                                        >
                                            <div>
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <FileText size={16} className="text-slate-500" />
                                                        <h3 className="text-xs font-semibold text-slate-400 line-clamp-1">
                                                            {doc.title}
                                                        </h3>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            onClick={(e) => handleRestoreFromTrash(e, doc.id)}
                                                            className="p-1 text-slate-650 hover:text-green-400 hover:bg-slate-850 rounded transition cursor-pointer"
                                                            title="Restore Document"
                                                        >
                                                            <RotateCcw size={13} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handlePermanentDelete(e, doc.id)}
                                                            className="p-1 text-slate-650 hover:text-red-400 hover:bg-slate-850 rounded transition cursor-pointer"
                                                            title="Delete Permanently"
                                                        >
                                                            <X size={13} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                                                    {doc.content}
                                                </p>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-600">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={11} />
                                                    <span>{doc.updatedAt}</span>
                                                </div>
                                                <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                                                    Trashed
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* View 4: Settings Dashboard Layout */}
                    {activeTab === 'settings' && (
                        <div className="max-w-2xl">
                            <div className="mb-8">
                                <h1 className="text-xl font-bold tracking-tight text-slate-100 font-display">System Settings</h1>
                                <p className="text-xs text-slate-500 mt-1">Manage your account preferences, theme interfaces, and document controls</p>
                            </div>

                            <form onSubmit={handleSaveSettings} className="space-y-8">
                                {/* Profile Preferences */}
                                <div className="border border-slate-800 bg-slate-900/30 rounded-lg p-6 space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                                        <Users size={14} className="text-blue-500" />
                                        <span>Account Profile</span>
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                                                Display Name
                                            </label>
                                            <input
                                                type="text"
                                                value={settingsName}
                                                onChange={(e) => setSettingsName(e.target.value)}
                                                className="w-full rounded border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-slate-250 outline-none focus:border-slate-700"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                disabled
                                                value={user?.email || 'mern@example.com'}
                                                className="w-full rounded border border-slate-850 bg-slate-950/40 py-2 px-3 text-xs text-slate-600 cursor-not-allowed outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Visual Interfaces */}
                                <div className="border border-slate-800 bg-slate-900/30 rounded-lg p-6 space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                                        <Monitor size={14} className="text-emerald-500" />
                                        <span>Visual Interface Theme</span>
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <label className={`border rounded-lg p-4 flex flex-col justify-between h-24 cursor-pointer transition select-none ${
                                            settingsTheme === 'deep-obsidian' 
                                                ? 'border-blue-500 bg-slate-900/80 text-slate-100' 
                                                : 'border-slate-800 bg-slate-950/20 text-slate-400 hover:border-slate-700'
                                        }`}>
                                            <input 
                                                type="radio" 
                                                name="theme" 
                                                value="deep-obsidian"
                                                checked={settingsTheme === 'deep-obsidian'}
                                                onChange={() => setSettingsTheme('deep-obsidian')}
                                                className="sr-only" 
                                            />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Deep Obsidian</span>
                                            <span className="text-[9px] text-slate-500">Dark blue and deep slate palette.</span>
                                        </label>

                                        <label className={`border rounded-lg p-4 flex flex-col justify-between h-24 cursor-pointer transition select-none ${
                                            settingsTheme === 'classic-dark' 
                                                ? 'border-blue-500 bg-slate-900/80 text-slate-100' 
                                                : 'border-slate-800 bg-slate-950/20 text-slate-400 hover:border-slate-700'
                                        }`}>
                                            <input 
                                                type="radio" 
                                                name="theme" 
                                                value="classic-dark"
                                                checked={settingsTheme === 'classic-dark'}
                                                onChange={() => setSettingsTheme('classic-dark')}
                                                className="sr-only" 
                                            />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Classic Dark</span>
                                            <span className="text-[9px] text-slate-500">Neutral dark and charcoal background.</span>
                                        </label>

                                        <label className={`border rounded-lg p-4 flex flex-col justify-between h-24 cursor-pointer transition select-none ${
                                            settingsTheme === 'monochrome' 
                                                ? 'border-blue-500 bg-slate-900/80 text-slate-100' 
                                                : 'border-slate-800 bg-slate-950/20 text-slate-400 hover:border-slate-700'
                                        }`}>
                                            <input 
                                                type="radio" 
                                                name="theme" 
                                                value="monochrome"
                                                checked={settingsTheme === 'monochrome'}
                                                onChange={() => setSettingsTheme('monochrome')}
                                                className="sr-only" 
                                            />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Monochrome Slate</span>
                                            <span className="text-[9px] text-slate-500">Pure minimal greyscale values.</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Security Toggles */}
                                <div className="border border-slate-800 bg-slate-900/30 rounded-lg p-6 space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                                        <Shield size={14} className="text-purple-500" />
                                        <span>Document Preferences</span>
                                    </h3>

                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={enableAutosave}
                                                onChange={() => setEnableAutosave(!enableAutosave)}
                                                className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-blue-500 outline-none focus:ring-0"
                                            />
                                            <div className="text-xs">
                                                <p className="font-semibold text-slate-200">Enable Collaborative Autosave</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">Saves editing sheet contents automatically to the server on every stroke.</p>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={presenceBubbles}
                                                onChange={() => setPresenceBubbles(!presenceBubbles)}
                                                className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-blue-500 outline-none focus:ring-0"
                                            />
                                            <div className="text-xs">
                                                <p className="font-semibold text-slate-200">Show Collaborator Presence Bubbles</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">Renders color-coded online badges of users actively inside the workspace.</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex items-center gap-4 pt-2">
                                    <button
                                        type="submit"
                                        className="flex items-center gap-1.5 rounded bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-750 cursor-pointer shadow-sm"
                                    >
                                        <Save size={14} />
                                        <span>Save System Preferences</span>
                                    </button>

                                    {settingsSaved && (
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-green-400">
                                            <CheckCircle size={14} />
                                            <span>Preferences updated successfully!</span>
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}

                </div>
            </main>

            {/* Creation Modal Overlay */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs px-4">
                    <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-md relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 cursor-pointer"
                        >
                            <X size={16} />
                        </button>

                        <h3 className="text-sm font-bold text-slate-200 font-display mb-4">Create New Document</h3>

                        <form onSubmit={handleCreateDocument} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    Document Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="Enter document title..."
                                    className="w-full rounded border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-slate-200 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    Template Style
                                </label>
                                <select
                                    value={newTemplate}
                                    onChange={(e) => setNewTemplate(e.target.value)}
                                    className="w-full rounded border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-slate-300 outline-none focus:border-blue-500"
                                >
                                    <option value="blank">Blank Strategy Sheet</option>
                                    <option value="code">Software Technical Design</option>
                                </select>
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="rounded border border-slate-800 bg-slate-950 hover:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-400 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-semibold text-white transition cursor-pointer"
                                >
                                    Create Document
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
