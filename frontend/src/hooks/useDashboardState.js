import { useState, useEffect } from 'react';

export const useDashboardState = (user, fetchDocuments, dbDocuments, dbCreateDocument, dbDeleteDocument, updateProfile, logout, navigate) => {
    const [activeTab, setActiveTab] = useState('documents');
    const [searchQuery, setSearchQuery] = useState('');
    const [trashDocuments, setTrashDocuments] = useState([]);
    
    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newTemplate, setNewTemplate] = useState('blank');
    
    const [settingsSaved, setSettingsSaved] = useState(false);
    const [settingsName, setSettingsName] = useState('');
    const [settingsTheme, setSettingsTheme] = useState('deep-obsidian');
    const [enableAutosave, setEnableAutosave] = useState(true);
    const [presenceBubbles, setPresenceBubbles] = useState(true);

    useEffect(() => {
        if (user?.name) setSettingsName(user.name);
        
        fetchDocuments();

        const storedTrash = localStorage.getItem('mock_trash');
        if (storedTrash) {
            setTrashDocuments(JSON.parse(storedTrash));
        } else {
            localStorage.setItem('mock_trash', JSON.stringify([]));
            setTrashDocuments([]);
        }

        const savedAutosave = localStorage.getItem('settings_autosave');
        if (savedAutosave !== null) setEnableAutosave(JSON.parse(savedAutosave));
        
        const savedPresence = localStorage.getItem('settings_presence');
        if (savedPresence !== null) setPresenceBubbles(JSON.parse(savedPresence));
        
        const savedTheme = localStorage.getItem('settings_theme');
        if (savedTheme !== null) setSettingsTheme(savedTheme);
    }, [user, fetchDocuments]);

    const isDocOwner = (doc) => {
        const ownerId = doc.owner?._id || doc.owner;
        return ownerId && user?.id && ownerId.toString() === user.id.toString();
    };

    const getOwnerInitials = (doc) => {
        if (doc.owner?.name) return doc.owner.name.substring(0, 2).toUpperCase();
        return 'US';
    };

    const getOwnerName = (doc) => {
        if (doc.owner?.name) return isDocOwner(doc) ? 'Me' : doc.owner.name;
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

        if (newDoc) navigate(`/document/${newDoc._id}`);
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

    return {
        activeTab, setActiveTab,
        searchQuery, setSearchQuery,
        trashDocuments, setTrashDocuments,
        showModal, setShowModal,
        newTitle, setNewTitle,
        newTemplate, setNewTemplate,
        settingsSaved, setSettingsSaved,
        settingsName, setSettingsName,
        settingsTheme, setSettingsTheme,
        enableAutosave, setEnableAutosave,
        presenceBubbles, setPresenceBubbles,
        isDocOwner, getOwnerInitials, getOwnerName, formatTimestamp, formatSnippet,
        handleCreateDocument, handleMoveToTrash, handleRestoreFromTrash, handlePermanentDelete,
        handleEmptyTrash, handleSaveSettings, handleLogout,
        activeList: getFilteredDocs()
    };
};
