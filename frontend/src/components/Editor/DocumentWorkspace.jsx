import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import useAuthStore from '../../store/useAuthStore';
import useDocStore from '../../store/useDocStore';
import Editor from './Editor';
import { 
    ArrowLeft, Check, CloudLightning, RefreshCw, Share2, 
    Copy, Mail, UserPlus,
    Sun, Moon, Save, AlertCircle
} from 'lucide-react';
import useThemeStore from '../../store/useThemeStore';
import { useSocket } from '../../hooks/useSocket';

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

    // Establish bidirectional WebSocket channel tagged to this specific document ID
    const { socket, connected } = useSocket(id, user);
    
    // Store Quill editor instance references to apply remote Deltas dynamically
    const [quill, setQuill] = useState(null);

    // Editor component state parameters
    const [title, setTitle] = useState('');
    const [saveStatus, setSaveStatus] = useState('All changes saved');
    const [showShare, setShowShare] = useState(false);
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

    // Handle incoming WebSocket operations (receive-changes)
    useEffect(() => {
        if (socket == null || quill == null) return;

        const handleReceiveChanges = (delta) => {
            // Apply delta updates instantly into Quill editor view
            quill.updateContents(delta);
        };

        socket.on('receive-changes', handleReceiveChanges);

        return () => {
            socket.off('receive-changes', handleReceiveChanges);
        };
    }, [socket, quill]);

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
    const handleEditorChange = (content, delta) => {
        editorContentRef.current = content;

        // Emit change operations to all other active editors in real-time
        if (socket != null && delta) {
            socket.emit('send-changes', delta);
        }

        if (!autosaveEnabled) {
            setSaveStatus('Changes pending');
            return;
        }

        setSaveStatus('Saving...');
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                // Prioritize high-performance WebSocket persistence to avoid HTTP overhead
                if (socket != null && connected) {
                    socket.emit('save-document', content);
                    setSaveStatus('All changes saved');
                } else {
                    // Resilient HTTP REST API fallback if connection drops
                    await updateContent(id, content);
                    setSaveStatus('All changes saved');
                }
            } catch (err) {
                setSaveStatus('Error saving');
            }
        }, 1500); // 1.5 seconds typing pause debounce delay
    };

    // Manual save handler for when Collaborative Autosave is turned off in Settings
    const handleManualSave = async () => {
        setSaveStatus('Saving...');
        try {
            // Prioritize high-performance WebSocket persistence
            if (socket != null && connected) {
                socket.emit('save-document', editorContentRef.current);
                setSaveStatus('All changes saved');
            } else {
                // Resilient fallback to REST API
                await updateContent(id, editorContentRef.current);
                setSaveStatus('All changes saved');
            }
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
        <div className="workspace-outer-wrapper flex flex-col h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden">
            {/* Header Navigation */}
            <header className="h-14 border-b border-slate-800 bg-slate-900/60 px-6 flex items-center justify-between min-h-14">
                <div className="flex items-center gap-4 flex-1">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition cursor-pointer"
                        title="Go back"
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
                        <div className={`save-status-badge flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] whitespace-nowrap transition-colors ${
                            saveStatus === 'Saving...' ? 'bg-slate-800/80 text-slate-400' :
                            saveStatus === 'Changes pending' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold' :
                            saveStatus === 'Error saving' ? 'bg-red-500/10 border border-red-500/30 text-red-400 font-semibold' :
                            'bg-slate-800/80 text-slate-400'
                        }`}>
                            {saveStatus === 'Saving...' ? (
                                <RefreshCw size={10} className="animate-spin text-blue-450" />
                            ) : saveStatus === 'Changes pending' ? (
                                <AlertCircle size={10} className="text-amber-400" />
                            ) : saveStatus === 'Error saving' ? (
                                <AlertCircle size={10} className="text-red-400" />
                            ) : (
                                <Check size={10} className="text-green-500" />
                            )}
                            <span>{saveStatus}</span>
                        </div>
                    </div>
                </div>

                {/* Collaboration Presence Indicators */}
                <div className="flex items-center gap-4">
                    {/* Live Sync Connection Status */}
                    {connected ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold select-none">
                            <CloudLightning size={12} className="animate-pulse text-emerald-450" />
                            <span>Live Sync</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold animate-pulse select-none">
                            <RefreshCw size={12} className="animate-spin text-amber-450" />
                            <span>Reconnecting...</span>
                        </div>
                    )}

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
                            className="flex items-center gap-1.5 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-355 transition cursor-pointer"
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
                                            className="flex-1 rounded border border-slate-800 bg-slate-955 px-2 py-1 text-xs text-slate-200 outline-none"
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
                {/* Plain Rich Editor Panel */}
                <main className="flex-1 flex flex-col bg-slate-950 overflow-hidden">

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
                            onInit={(instance) => setQuill(instance)}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default DocumentWorkspace;
