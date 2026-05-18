import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import useAuthStore from '../../store/useAuthStore';
import useDocStore from '../../store/useDocStore';
import useThemeStore from '../../store/useThemeStore';

// Import newly refactored dashboard modular views
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import DocumentGrid from './DocumentGrid';
import TrashGrid from './TrashGrid';
import SettingsPanel from './SettingsPanel';
import CreateDocModal from './CreateDocModal';

/**
 * Dashboard Container Component.
 * Orchestrates MERN data fetching, visual mode switches, local settings,
 * account display names, and client-side Trash logs, delegating layout rendering to modular views.
 */
const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout, updateProfile } = useAuthStore();
    const { 
        documents: dbDocuments, 
        fetchDocuments, 
        createDocument: dbCreateDocument, 
        deleteDocument: dbDeleteDocument,
        loading: docsLoading 
    } = useDocStore();
    const { theme, toggleTheme } = useThemeStore();
    
    // Core navigation state (toggles between workspace documents, shared sheets, settings, and trash bins)
    const [activeTab, setActiveTab] = useState('documents');
    
    // Search queries (filters active list titles reactively)
    const [searchQuery, setSearchQuery] = useState('');
    
    // Document collections (caches deleted items in temporary client-side mock trash bin)
    const [trashDocuments, setTrashDocuments] = useState([]);
    
    // Modal & creation states (manages document generation modal overlays)
    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newTemplate, setNewTemplate] = useState('blank');
    
    // Settings feedback states (monitors input form profiles, custom autosave toggle triggers)
    const [settingsSaved, setSettingsSaved] = useState(false);
    const [settingsName, setSettingsName] = useState('');
    const [settingsTheme, setSettingsTheme] = useState('deep-obsidian');
    const [enableAutosave, setEnableAutosave] = useState(true);
    const [presenceBubbles, setPresenceBubbles] = useState(true);

    // Initial seed list for Trash list
    const defaultTrash = [];

    // Load initial states from LocalStorage or seed defaults
    useEffect(() => {
        if (user?.name) {
            setSettingsName(user.name);
        }
        
        // Fetch active documents from MERN backend
        fetchDocuments();

        const storedTrash = localStorage.getItem('mock_trash');
        if (storedTrash) {
            setTrashDocuments(JSON.parse(storedTrash));
        } else {
            localStorage.setItem('mock_trash', JSON.stringify(defaultTrash));
            setTrashDocuments(defaultTrash);
        }

        // Load document preference states from LocalStorage
        const savedAutosave = localStorage.getItem('settings_autosave');
        if (savedAutosave !== null) {
            setEnableAutosave(JSON.parse(savedAutosave));
        }
        const savedPresence = localStorage.getItem('settings_presence');
        if (savedPresence !== null) {
            setPresenceBubbles(JSON.parse(savedPresence));
        }
        const savedTheme = localStorage.getItem('settings_theme');
        if (savedTheme !== null) {
            setSettingsTheme(savedTheme);
        }
    }, [user, fetchDocuments]);

    // Helpers to check ownership and format credentials
    
    const isDocOwner = (doc) => {
        const ownerId = doc.owner?._id || doc.owner;
        return ownerId && user?.id && ownerId.toString() === user.id.toString();
    };

    const getOwnerInitials = (doc) => {
        if (doc.owner?.name) {
            return doc.owner.name.substring(0, 2).toUpperCase();
        }
        return 'US';
    };

    const getOwnerName = (doc) => {
        if (doc.owner?.name) {
            return isDocOwner(doc) ? 'Me' : doc.owner.name;
        }
        return 'Unknown';
    };

    const formatTimestamp = (dateString) => {
        if (!dateString) return 'Just now';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `${diffHrs}h ago`;
        
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    const formatSnippet = (content) => {
        if (!content) return 'Empty document. Start collaborating...';
        if (typeof content === 'object') {
            if (content.ops && Array.isArray(content.ops)) {
                return content.ops.map(op => op.insert).join('').substring(0, 100) || 'Empty strategy sheet...';
            }
            return JSON.stringify(content).substring(0, 100);
        }
        return content.substring(0, 100);
    };

    // Handlers
    
    const handleCreateDocument = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        const templateContent = newTemplate === 'code' 
            ? '// Write your software technical design here\n' 
            : 'Start typing your collaborative strategy sheet here...\n';

        const newDoc = await dbCreateDocument(newTitle.trim(), templateContent);
        
        setShowModal(false);
        setNewTitle('');
        setNewTemplate('blank');

        if (newDoc) {
            navigate(`/document/${newDoc._id}`);
        }
    };

    const handleMoveToTrash = async (e, id) => {
        e.stopPropagation();
        const docToTrash = dbDocuments.find(doc => doc._id === id);
        if (!docToTrash) return;

        const res = await dbDeleteDocument(id);
        if (res.success) {
            const updatedTrash = [
                {
                    id: docToTrash._id,
                    title: docToTrash.title,
                    content: docToTrash.content,
                    updatedAt: new Date().toISOString(),
                    ownerInitials: getOwnerInitials(docToTrash)
                },
                ...trashDocuments
            ];
            setTrashDocuments(updatedTrash);
            localStorage.setItem('mock_trash', JSON.stringify(updatedTrash));
        } else {
            alert(`Failed to delete document: ${res.error || 'Access denied'}`);
        }
    };

    const handleRestoreFromTrash = async (e, id) => {
        e.stopPropagation();
        const docToRestore = trashDocuments.find(doc => doc.id === id);
        if (!docToRestore) return;

        const newDoc = await dbCreateDocument(docToRestore.title, docToRestore.content);
        if (newDoc) {
            const updatedTrash = trashDocuments.filter(doc => doc.id !== id);
            setTrashDocuments(updatedTrash);
            localStorage.setItem('mock_trash', JSON.stringify(updatedTrash));
        } else {
            alert('Failed to restore document to server.');
        }
    };

    const handlePermanentDelete = (e, id) => {
        e.stopPropagation();
        const updatedTrash = trashDocuments.filter(doc => doc.id !== id);
        setTrashDocuments(updatedTrash);
        localStorage.setItem('mock_trash', JSON.stringify(updatedTrash));
    };

    const handleEmptyTrash = () => {
        setTrashDocuments([]);
        localStorage.setItem('mock_trash', JSON.stringify([]));
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSettingsSaved(false);

        try {
            if (settingsName.trim() && settingsName.trim() !== user?.name) {
                await updateProfile(settingsName.trim());
            }

            localStorage.setItem('settings_autosave', JSON.stringify(enableAutosave));
            localStorage.setItem('settings_presence', JSON.stringify(presenceBubbles));
            localStorage.setItem('settings_theme', settingsTheme);

            setSettingsSaved(true);
            setTimeout(() => setSettingsSaved(false), 3000);
        } catch (err) {
            console.error("Failed to save settings:", err);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Filter selectors
    const getFilteredDocs = () => {
        if (activeTab === 'documents') {
            return dbDocuments
                .filter(doc => isDocOwner(doc))
                .filter(doc => doc.title.toLowerCase().includes(searchQuery.toLowerCase()));
        } else if (activeTab === 'shared') {
            return dbDocuments
                .filter(doc => !isDocOwner(doc))
                .filter(doc => doc.title.toLowerCase().includes(searchQuery.toLowerCase()));
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
            {/* Sidebar Subcomponent */}
            <DashboardSidebar 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
                handleLogout={handleLogout}
            />

            {/* Main Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                
                {/* Search & Actions Header Subcomponent */}
                {activeTab !== 'settings' && (
                    <DashboardHeader 
                        activeTab={activeTab}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        theme={theme}
                        toggleTheme={toggleTheme}
                        setShowModal={setShowModal}
                        trashCount={trashDocuments.length}
                        handleEmptyTrash={handleEmptyTrash}
                    />
                )}

                {/* Main Views Panel */}
                <div className="flex-1 overflow-y-auto p-8">
                    
                    {/* loading state spinner */}
                    {docsLoading && activeTab !== 'settings' && activeTab !== 'trash' && (
                        <div className="flex justify-center items-center h-48 text-xs font-semibold text-slate-500">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent mr-2"></div>
                            <span>Retrieving records from database...</span>
                        </div>
                    )}

                    {/* View 1: Active Documents Grid */}
                    {activeTab === 'documents' && !docsLoading && (
                        <>
                            <div className="mb-6">
                                <h1 className="text-xl font-bold tracking-tight text-slate-100 font-display">Documents</h1>
                                <p className="text-xs text-slate-500 mt-1">Access your clean MERN collaborative notebooks</p>
                            </div>

                            <DocumentGrid 
                                documents={activeList}
                                isShared={false}
                                formatSnippet={formatSnippet}
                                formatTimestamp={formatTimestamp}
                                getOwnerInitials={getOwnerInitials}
                                getOwnerName={getOwnerName}
                                handleMoveToTrash={handleMoveToTrash}
                                navigate={navigate}
                            />
                        </>
                    )}

                    {/* View 2: Shared with Me Grid */}
                    {activeTab === 'shared' && !docsLoading && (
                        <>
                            <div className="mb-6">
                                <h1 className="text-xl font-bold tracking-tight text-slate-100 font-display">Shared with Me</h1>
                                <p className="text-xs text-slate-500 mt-1">Sheets shared with you by other active team members</p>
                            </div>

                            <DocumentGrid 
                                documents={activeList}
                                isShared={true}
                                formatSnippet={formatSnippet}
                                formatTimestamp={formatTimestamp}
                                getOwnerInitials={getOwnerInitials}
                                getOwnerName={getOwnerName}
                                handleMoveToTrash={handleMoveToTrash}
                                navigate={navigate}
                            />
                        </>
                    )}

                    {/* View 3: Trash Grid */}
                    {activeTab === 'trash' && (
                        <>
                            <div className="mb-6">
                                <h1 className="text-xl font-bold tracking-tight text-slate-100 font-display">Trash Bin</h1>
                                <p className="text-xs text-slate-500 mt-1">Review, restore, or permanently delete items from your workspace</p>
                            </div>

                            <TrashGrid 
                                trashDocuments={activeList}
                                formatSnippet={formatSnippet}
                                formatTimestamp={formatTimestamp}
                                handleRestoreFromTrash={handleRestoreFromTrash}
                                handlePermanentDelete={handlePermanentDelete}
                            />
                        </>
                    )}

                    {/* View 4: Settings Panel */}
                    {activeTab === 'settings' && (
                        <SettingsPanel 
                            settingsName={settingsName}
                            setSettingsName={setSettingsName}
                            user={user}
                            settingsTheme={settingsTheme}
                            setSettingsTheme={setSettingsTheme}
                            enableAutosave={enableAutosave}
                            setEnableAutosave={setEnableAutosave}
                            presenceBubbles={presenceBubbles}
                            setPresenceBubbles={setPresenceBubbles}
                            handleSaveSettings={handleSaveSettings}
                            settingsSaved={settingsSaved}
                        />
                    )}

                </div>
            </main>

            {/* Create New Document Modal Subcomponent */}
            <CreateDocModal 
                showModal={showModal}
                setShowModal={setShowModal}
                newTitle={newTitle}
                setNewTitle={setNewTitle}
                newTemplate={newTemplate}
                setNewTemplate={setNewTemplate}
                handleCreateDocument={handleCreateDocument}
            />
        </div>
    );
};

export default Dashboard;
