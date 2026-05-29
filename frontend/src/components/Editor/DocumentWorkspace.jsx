import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import useDocStore from '../../store/useDocStore';
import Editor from './Editor';
import useThemeStore from '../../store/useThemeStore';
import { useSocket } from '../../hooks/useSocket';

// Import newly refactored editor modular views
import WorkspaceHeader from './WorkspaceHeader';
import WorkspacePresence from './WorkspacePresence';
import WorkspaceActions from './WorkspaceActions';
import RemoteCursorsOverlay from './RemoteCursorsOverlay';

/**
 * Collaborative Document Editor Workspace.
 * Handles bidirectional WebSocket syncing, client selection changes, and debounced REST persistence,
 * delegating navbar layout and coordinate overlays to modular components.
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
    const [inviteLinkCopied, setInviteLinkCopied] = useState(false);

    // Dynamic collaborative presence states
    const [activeUsers, setActiveUsers] = useState([]);
    const [remoteCursors, setRemoteCursors] = useState({}); // { [socketId]: { user, bounds } }
    
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

    // Handle incoming WebSocket operations and collaborator presence events
    useEffect(() => {
        if (socket == null || quill == null) return;

        const handleReceiveChanges = (delta) => {
            // Apply delta updates instantly into Quill editor view
            quill.updateContents(delta);
        };

        const handleActiveUsers = (users) => {
            setActiveUsers(users);
        };

        const handleUserJoined = (newUser) => {
            setActiveUsers((prev) => {
                if (prev.some((u) => u.id === newUser.id)) return prev;
                return [...prev, newUser];
            });
        };

        const handleRemoteCursor = ({ socketId, user: remoteUser, range }) => {
            if (!range) {
                // If selection range is empty, remove remote cursor
                setRemoteCursors((prev) => {
                    const next = { ...prev };
                    delete next[socketId];
                    return next;
                });
                return;
            }

            // Translate character index into local pixel coordinate boundaries
            try {
                const bounds = quill.getBounds(range.index);
                if (bounds) {
                    setRemoteCursors((prev) => ({
                        ...prev,
                        [socketId]: { user: remoteUser, bounds }
                    }));
                }
            } catch (err) {
                // Catch index errors if indexes are out of bounds briefly
            }
        };

        const handleUserLeft = (socketId) => {
            // Remove collaborator presence elements instantly
            setActiveUsers((prev) => prev.filter((u) => u.id !== socketId));
            setRemoteCursors((prev) => {
                const next = { ...prev };
                delete next[socketId];
                return next;
            });
        };

        socket.on('receive-changes', handleReceiveChanges);
        socket.on('active-users-list', handleActiveUsers);
        socket.on('user-joined', handleUserJoined);
        socket.on('remote-cursor-move', handleRemoteCursor);
        socket.on('user-left', handleUserLeft);

        return () => {
            socket.off('receive-changes', handleReceiveChanges);
            socket.off('active-users-list', handleActiveUsers);
            socket.off('user-joined', handleUserJoined);
            socket.off('remote-cursor-move', handleRemoteCursor);
            socket.off('user-left', handleUserLeft);
        };
    }, [socket, quill]);

    // Handle Local Selection Movements and broadcast to other collaborators
    useEffect(() => {
        if (socket == null || quill == null) return;

        const selectionHandler = (range, oldRange, source) => {
            if (source !== 'user') return;
            // Emit cursor location to other collaborators in real-time
            socket.emit('cursor-move', range);
        };

        quill.on('selection-change', selectionHandler);

        return () => {
            quill.off('selection-change', selectionHandler);
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

    const handleCopyInviteLink = () => {
        const inviteLink = `${window.location.origin}/join/${id}`;
        navigator.clipboard.writeText(inviteLink);
        setInviteLinkCopied(true);
        setTimeout(() => setInviteLinkCopied(false), 2000);
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

    return (
        <div className="workspace-outer-wrapper flex flex-col h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden">
            {/* Header Navigation */}
            <header className="h-14 border-b border-slate-800 bg-slate-900/60 px-6 flex items-center justify-between min-h-14">
                {/* Title and Badge Subcomponent */}
                <WorkspaceHeader 
                    title={title}
                    handleTitleChange={handleTitleChange}
                    saveStatus={saveStatus}
                    navigate={navigate}
                />

                {/* Right Header Navigation Panel */}
                <div className="flex items-center gap-4">
                    {/* Live Sync Presence Indicators Subcomponent */}
                    <WorkspacePresence 
                        connected={connected}
                        showPresence={showPresence}
                        activeUsers={activeUsers}
                    />

                    {/* Actions and Popovers Subcomponent */}
                    <WorkspaceActions 
                        id={id}
                        autosaveEnabled={autosaveEnabled}
                        handleManualSave={handleManualSave}
                        showShare={showShare}
                        setShowShare={setShowShare}
                        inviteLinkCopied={inviteLinkCopied}
                        handleCopyInviteLink={handleCopyInviteLink}
                        inviteEmail={inviteEmail}
                        setInviteEmail={setInviteEmail}
                        handleInviteCollaborator={handleInviteCollaborator}
                        inviteMessage={inviteMessage}
                        inviteSuccess={inviteSuccess}
                        theme={theme}
                        toggleTheme={toggleTheme}
                    />
                </div>
            </header>

            {/* Split Workspace Layout */}
            <div className="flex-1 flex overflow-hidden relative">
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

                {/* Remote Cursors Overlay Subcomponent */}
                <RemoteCursorsOverlay 
                    showPresence={showPresence}
                    remoteCursors={remoteCursors}
                />
            </div>
        </div>
    );
};

export default DocumentWorkspace;
