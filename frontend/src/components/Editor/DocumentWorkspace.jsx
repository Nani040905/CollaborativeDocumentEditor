import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import useAuthStore from '../../store/useAuthStore';
import useDocStore from '../../store/useDocStore';
import Editor from './Editor';
import { 
    ArrowLeft, Check, CloudLightning, RefreshCw, Share2, 
    ChevronRight, AlignLeft, Copy, Mail, UserPlus,
    Sun, Moon, Save
} from 'lucide-react';
import useThemeStore from '../../store/useThemeStore';

/**
 * Collaborative Document Editor Workspace.
 * Links together the Quill canvas, visual theme selector store, inline title editors,
 * debounced auto-save triggers, collaborator invitation popups, and real-time active user bubble listings.
 */
const DocumentWorkspace = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { 
        currentDocument, 
        fetchDocumentById, 
        updateTitleInDashboard, 
        inviteCollaborator, 
        updateContent,
        loading: docsLoading 
    } = useDocStore();
    const { theme, toggleTheme } = useThemeStore();

    // Editor component state parameters
    const [title, setTitle] = useState('');
    const [saveStatus, setSaveStatus] = useState('All changes saved');
    const [showShare, setShowShare] = useState(false);
    const [showOutline, setShowOutline] = useState(true);
    const [copied, setCopied] = useState(false);
    
    // Collaborator invite states
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');
    const [inviteSuccess, setInviteSuccess] = useState(false);

    // Document preference controls loaded from user Settings
    const [autosaveEnabled, setAutosaveEnabled] = useState(true);
    const [showPresence, setShowPresence] = useState(true);
    const saveTimeoutRef = useRef(null);
    const editorContentRef = useRef('');

    // Load visual settings on mount
    useEffect(() => {
        const savedAutosave = localStorage.getItem('settings_autosave');
        if (savedAutosave !== null) {
            setAutosaveEnabled(JSON.parse(savedAutosave));
        }
        const savedPresence = localStorage.getItem('settings_presence');
        if (savedPresence !== null) {
            setShowPresence(JSON.parse(savedPresence));
        }
    }, []);

    // Fetch document details from live database on load
    useEffect(() => {
        fetchDocumentById(id)
            .then((doc) => {
                if (doc) {
                    setTitle(doc.title);
                    editorContentRef.current = doc.content || '';
                }
            })
            .catch(() => {
                // If denied or not found, return to dashboard
                navigate('/dashboard');
            });
    }, [id, fetchDocumentById, navigate]);

    // Update internal state title once document compiles
    useEffect(() => {
        if (currentDocument) {
            setTitle(currentDocument.title);
        }
    }, [currentDocument]);

    // Handle title updates inline back to server
    const handleTitleChange = async (e) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (currentDocument) {
            await updateTitleInDashboard(id, newTitle);
        }
    };

    // Auto-save rich-text edits back to MongoDB (debounced to buffer requests)
    const handleEditorChange = (content) => {
        editorContentRef.current = content;
        if (!autosaveEnabled) return;

        setSaveStatus('Saving...');
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await updateContent(id, content);
                setSaveStatus('All changes saved');
            } catch (err) {
                setSaveStatus('Error saving');
            }
        }, 1000);
    };

    // Manual save handler for when Collaborative Autosave is turned off in Settings
    const handleManualSave = async () => {
        setSaveStatus('Saving...');
        try {
            await updateContent(id, editorContentRef.current);
            setSaveStatus('All changes saved');
        } catch (err) {
            setSaveStatus('Error saving');
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Invite collaborator handler
    const handleInviteCollaborator = async (e) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;

        setInviteMessage('Sending invitation...');
        const res = await inviteCollaborator(id, inviteEmail.trim().toLowerCase());
        
        if (res.success) {
            setInviteSuccess(true);
            setInviteMessage(res.message || 'Collaborator added successfully!');
            setInviteEmail('');
            // Refresh document details to populate new collaborator lists
            fetchDocumentById(id);
        } else {
            setInviteSuccess(false);
            setInviteMessage(res.error || 'Failed to add collaborator.');
        }

        setTimeout(() => setInviteMessage(''), 4000);
    };

    const getCollaboratorInitials = (c) => {
        if (c.name) return c.name.substring(0, 2).toUpperCase();
        return 'US';
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden">
            {/* Header Navigation */}
            <header className="h-14 border-b border-slate-800 bg-slate-900/60 px-6 flex items-center justify-between min-h-14">
                <div className="flex items-center gap-4 flex-1">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition cursor-pointer"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft size={16} />
                    </button>

                    <div className="flex items-center gap-3 max-w-lg flex-1">
                        <input
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            className="bg-transparent border-none text-sm font-semibold text-slate-100 outline-none w-full focus:ring-1 focus:ring-slate-800 rounded px-1 py-0.5"
                            placeholder="Untitled Document"
                        />
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800/80 text-[10px] text-slate-400 whitespace-nowrap">
                            {saveStatus === 'Saving...' ? (
                                <RefreshCw size={10} className="animate-spin text-blue-450" />
                            ) : (
                                <Check size={10} className="text-green-500" />
                            )}
                            <span>{saveStatus}</span>
                        </div>
                    </div>
                </div>

                {/* Collaboration Presence Indicators */}
                <div className="flex items-center gap-4">
                    {/* User Presence Circles */}
                    {showPresence && currentDocument && (
                        <div className="flex items-center -space-x-1.5" title="Collaborators active in workspace">
                            {/* Document Owner */}
                            <div className="h-6 w-6 rounded-full border border-slate-900 bg-blue-600 text-[9px] font-bold text-white flex items-center justify-center cursor-default" title={`Owner: ${currentDocument.owner?.name}`}>
                                {currentDocument.owner?.name ? currentDocument.owner.name.substring(0, 2).toUpperCase() : 'ME'}
                            </div>

                            {/* Registered Collaborators */}
                            {currentDocument.collaborators?.map((c) => (
                                <div key={c._id} className="h-6 w-6 rounded-full border border-slate-900 bg-purple-750 text-[9px] font-bold text-white flex items-center justify-center cursor-default" title={`Collaborator: ${c.name}`}>
                                    {getCollaboratorInitials(c)}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Theme Toggle Switch */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center justify-center p-2 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer select-none"
                        title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                    >
                        {theme === 'dark' ? <Moon size={13} className="text-blue-400" /> : <Sun size={13} className="text-yellow-500" />}
                    </button>

                    {!autosaveEnabled && (
                        <button
                            onClick={handleManualSave}
                            className="flex items-center gap-1.5 rounded bg-blue-600 hover:bg-blue-750 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 cursor-pointer select-none"
                            title="Save Changes to Cloud"
                        >
                            <Save size={13} />
                            <span>Save</span>
                        </button>
                    )}

                    {/* Share Trigger */}
                    <div className="relative">
                        <button
                            onClick={() => setShowShare(!showShare)}
                            className="flex items-center gap-1.5 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-350 transition cursor-pointer"
                        >
                            <Share2 size={13} />
                            <span>Share</span>
                        </button>

                        {showShare && (
                            <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-800 bg-slate-900 p-4 shadow-md z-30 space-y-4">
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-200 mb-1">Share Workspace URL</h4>
                                    <p className="text-[9px] text-slate-500 mb-2">Copy this workspace URL to collaborate in real-time.</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={window.location.href}
                                            className="flex-1 rounded border border-slate-800 bg-slate-950 px-2 py-1 text-[10px] text-slate-400 select-all outline-none"
                                        />
                                        <button
                                            onClick={handleCopyLink}
                                            className="p-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
                                            title="Copy link"
                                        >
                                            {copied ? <Check size={14} /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t border-slate-800 pt-3">
                                    <h4 className="text-xs font-semibold text-slate-200 mb-1">Invite Collaborator</h4>
                                    <p className="text-[9px] text-slate-500 mb-2">Add a user to this workspace via their registered email.</p>
                                    <form onSubmit={handleInviteCollaborator} className="flex gap-2">
                                        <input
                                            type="email"
                                            required
                                            placeholder="user@example.com"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            className="flex-1 rounded border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-200 outline-none"
                                        />
                                        <button
                                            type="submit"
                                            className="rounded bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 text-xs font-semibold transition cursor-pointer"
                                        >
                                            Invite
                                        </button>
                                    </form>
                                    {inviteMessage && (
                                        <p className={`text-[9px] mt-2 font-semibold ${inviteSuccess ? 'text-green-400' : 'text-red-400'}`}>
                                            {inviteMessage}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Split Workspace Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Outline Left Sidebar */}
                {showOutline && (
                    <aside className="w-56 border-r border-slate-800 bg-slate-900/40 p-4 space-y-4 overflow-y-auto hidden md:block select-none">
                        <div className="flex items-center gap-1.5 text-slate-450">
                            <AlignLeft size={14} />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Document Outline</span>
                        </div>
                        <ul className="text-xs space-y-2">
                            <li className="flex items-center gap-1 text-slate-350 hover:text-slate-100 cursor-pointer">
                                <ChevronRight size={12} className="text-slate-650" />
                                <span className="font-medium line-clamp-1">1. Summary & Intro</span>
                            </li>
                            <li className="flex items-center gap-1 text-slate-500 hover:text-slate-300 cursor-pointer pl-2">
                                <ChevronRight size={12} className="text-slate-700" />
                                <span className="line-clamp-1">Scope & Parameters</span>
                            </li>
                            <li className="flex items-center gap-1 text-slate-350 hover:text-slate-100 cursor-pointer">
                                <ChevronRight size={12} className="text-slate-650" />
                                <span className="font-medium line-clamp-1">2. Architecture Blueprint</span>
                            </li>
                            <li className="flex items-center gap-1 text-slate-350 hover:text-slate-100 cursor-pointer">
                                <ChevronRight size={12} className="text-slate-650" />
                                <span className="font-medium line-clamp-1">3. Action Items</span>
                            </li>
                        </ul>
                    </aside>
                )}

                {/* Plain Rich Editor Panel */}
                <main className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
                    {/* Outline toggle bar */}
                    <div className="h-10 border-b border-slate-850 px-6 flex items-center bg-slate-950/20 text-slate-450 select-none">
                        <button 
                            onClick={() => setShowOutline(!showOutline)}
                            className={`p-1 hover:bg-slate-800 rounded transition cursor-pointer ${showOutline ? 'text-blue-450 bg-slate-900/60' : ''}`}
                            title="Toggle Outline Panel"
                        >
                            <AlignLeft size={14} />
                        </button>
                    </div>

                    {/* Quill Rich Text Editor */}
                    {docsLoading ? (
                        <div className="flex justify-center items-center flex-1 text-xs font-semibold text-slate-500">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent mr-2"></div>
                            <span>Connecting editor to MERN cluster...</span>
                        </div>
                    ) : (
                        <Editor 
                            value={currentDocument?.content} 
                            onChange={handleEditorChange}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default DocumentWorkspace;
