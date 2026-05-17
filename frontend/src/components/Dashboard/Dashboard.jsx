import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import useAuthStore from '../../store/useAuthStore';
import { 
    FileText, Plus, Search, LogOut, Trash2, 
    Settings, Users, FolderOpen, Calendar, X 
} from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [documents, setDocuments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newTemplate, setNewTemplate] = useState('blank');

    // Default mock documents if none exist in localStorage
    const defaultDocs = [
        { id: 'doc-1', title: 'Product Roadmap & Strategy 2026', updatedAt: '2 hours ago', ownerInitials: 'JD', shares: 3, content: 'This is the strategic roadmap for the upcoming product lifecycle...' },
        { id: 'doc-2', title: 'Weekly Engineering Sync Notes', updatedAt: 'Yesterday', ownerInitials: 'SK', shares: 1, content: 'Discussed task status and frontend routing setup with Tailwind CSS v4...' },
        { id: 'doc-3', title: 'MERN Stack Architecture Spec', updatedAt: '3 days ago', ownerInitials: 'JD', shares: 5, content: 'Architectural breakdown of backend JWT authentications and socket connections...' }
    ];

    useEffect(() => {
        const stored = localStorage.getItem('mock_documents');
        if (stored) {
            setDocuments(JSON.parse(stored));
        } else {
            localStorage.setItem('mock_documents', JSON.stringify(defaultDocs));
            setDocuments(defaultDocs);
        }
    }, []);

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

    const handleDeleteDocument = (e, id) => {
        e.stopPropagation(); // Avoid triggering open card navigate
        const updated = documents.filter(doc => doc.id !== id);
        setDocuments(updated);
        localStorage.setItem('mock_documents', JSON.stringify(updated));
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const filteredDocs = documents.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen w-screen bg-slate-950 text-slate-200">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col justify-between">
                <div>
                    {/* Header */}
                    <div className="p-6 border-b border-slate-800 flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded text-white font-bold text-sm tracking-widest font-display">
                            CDE
                        </div>
                        <span className="font-semibold text-slate-100 font-display tracking-wider">COLLAB EDIT</span>
                    </div>

                    {/* Navigation */}
                    <nav className="p-4 space-y-1">
                        <button className="flex w-full items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-300 rounded bg-slate-800/80 cursor-pointer">
                            <FolderOpen size={16} className="text-blue-500" />
                            <span>All Documents</span>
                        </button>
                        <button className="flex w-full items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-400 rounded hover:bg-slate-800/50 hover:text-slate-200 cursor-pointer">
                            <Users size={16} />
                            <span>Shared with Me</span>
                        </button>
                        <button className="flex w-full items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-400 rounded hover:bg-slate-800/50 hover:text-slate-200 cursor-pointer">
                            <Settings size={16} />
                            <span>Settings</span>
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
                            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Mock User'}</p>
                            <p className="text-[10px] text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded hover:bg-slate-800 cursor-pointer"
                        title="Sign Out"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Search Header */}
                <header className="h-16 border-b border-slate-800 px-8 flex items-center justify-between min-h-16">
                    <div className="relative w-80">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                            <Search size={15} />
                        </span>
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded border border-slate-800 bg-slate-900/60 py-1.5 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-600 outline-none transition focus:border-slate-700 focus:bg-slate-900"
                        />
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-1.5 rounded bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 cursor-pointer"
                    >
                        <Plus size={14} />
                        <span>New Document</span>
                    </button>
                </header>

                {/* Dashboard Grid */}
                <section className="flex-1 overflow-y-auto p-8">
                    <div className="mb-6">
                        <h1 className="text-xl font-bold tracking-tight text-slate-100 font-display">Documents</h1>
                        <p className="text-xs text-slate-500 mt-1">Access your clean collaborative notebooks</p>
                    </div>

                    {filteredDocs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-lg p-16 text-center">
                            <FileText size={40} className="text-slate-600 mb-3" />
                            <h3 className="text-sm font-semibold text-slate-300">No documents found</h3>
                            <p className="text-xs text-slate-500 mt-1">Create a new collaborative sheet to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredDocs.map((doc) => (
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
                                                onClick={(e) => handleDeleteDocument(e, doc.id)}
                                                className="p-1 text-slate-600 hover:text-red-400 hover:bg-slate-800 rounded transition cursor-pointer"
                                                title="Delete document"
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
                </section>
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
