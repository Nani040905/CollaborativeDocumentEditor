# Part 11: Collaborative Presence (Active Collaborators & Remote Cursors)

In this guide, you will add visual indicators for other active users. You will track active room lists on the backend, display color-coded member initials in the header, and implement remote cursor tracking to show where other collaborators are typing in real time.

---

## 1. Tracking Active Collaborators on the Server

To display active collaborators, the backend must keep track of which socket IDs belong to which users within each document room.

### Updating Socket Handler (`sockets/socketHandler.js`)
We use an in-memory tracking object `activeUsers` mapping `documentId -> [users]` to trace room occupants. Replace `backend/sockets/socketHandler.js` with this updated script:

```javascript
import Document from '../models/Document.js';

// Memory store to track active users per document room
// Schema: { [documentId]: { [socketId]: { id, name, email, color } } }
const activeRooms = {};

// Palette for generating random user cursor colors
const CURSOR_COLORS = [
    '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', 
    '#ec4899', '#f43f5e', '#14b8a6', '#06b6d4'
];

const socketHandler = (io) => {
    io.on('connection', (socket) => {

        socket.on('join-document', ({ documentId, user }) => {
            if (!documentId || !user) return;

            socket.join(documentId);
            socket.documentId = documentId;
            
            // Assign a random color for cursor overlays
            const userColor = CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
            const userProfile = { ...user, color: userColor };
            socket.user = userProfile;

            // Initialize room container if empty
            if (!activeRooms[documentId]) {
                activeRooms[documentId] = {};
            }
            // Save user to active list
            activeRooms[documentId][socket.id] = userProfile;

            // Send list of all active users in the room back to the client that just joined
            socket.emit('active-users-list', Object.values(activeRooms[documentId]));

            // Broadcast to everyone else in the room that a new collaborator has joined
            socket.broadcast.to(documentId).emit('user-joined', userProfile);
        });

        // Broadcast cursor selection movements
        socket.on('cursor-move', (range) => {
            const { documentId, user } = socket;
            if (!documentId || !user) return;

            // Broadcast remote user's cursor selection to other clients
            socket.broadcast.to(documentId).emit('remote-cursor-move', {
                socketId: socket.id,
                user,
                range
            });
        });

        socket.on('send-changes', (delta) => {
            const { documentId } = socket;
            if (documentId) {
                socket.broadcast.to(documentId).emit('receive-changes', delta);
            }
        });

        socket.on('save-document', async (content) => {
            const { documentId } = socket;
            if (documentId) {
                await Document.findByIdAndUpdate(documentId, { content });
            }
        });

        socket.on('disconnect', () => {
            const { documentId, user } = socket;

            if (documentId && activeRooms[documentId]) {
                // Remove user from active dictionary
                delete activeRooms[documentId][socket.id];
                
                // Clear empty room containers
                if (Object.keys(activeRooms[documentId]).length === 0) {
                    delete activeRooms[documentId];
                } else {
                    // Update other room users
                    io.to(documentId).emit('active-users-list', Object.values(activeRooms[documentId]));
                }
            }

            if (documentId && user) {
                socket.broadcast.to(documentId).emit('user-left', socket.id);
            }
        });
    });
};

export default socketHandler;
```

---

## 2. Rendering Cursors in React

To draw other users' cursors, we track selection coordinates, convert the editor indexes into local pixel offsets using Quill's `getBounds` helper, and overlay HTML flags.

### Real-Time Workspace Update (`components/Editor/DocumentWorkspace.jsx`)
Replace your `frontend/src/components/Editor/DocumentWorkspace.jsx` file to handle collaborative presence:

```jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Cloud, CloudRain, Save, Users } from 'lucide-react';
import useDocStore from '../../store/useDocStore';
import useAuthStore from '../../store/useAuthStore';
import { useSocket } from '../../hooks/useSocket';
import Editor from './Editor';

const DocumentWorkspace = () => {
    const { id: documentId } = useParams();
    const navigate = useNavigate();
    
    const { currentDocument, fetchDocumentById, clearCurrentDocument } = useDocStore();
    const { user } = useAuthStore();
    const { socket, connected } = useSocket(documentId, user);
    
    const [quill, setQuill] = useState(null);
    const [savingStatus, setSavingStatus] = useState('Saved');
    const [activeUsers, setActiveUsers] = useState([]);
    
    // Store cursor coordinate bounds locally
    const [remoteCursors, setRemoteCursors] = useState({}); // { [socketId]: { user, bounds } }

    useEffect(() => {
        fetchDocumentById(documentId).catch(() => {
            navigate('/dashboard');
        });
        return () => {
            clearCurrentDocument();
        };
    }, [documentId, fetchDocumentById, navigate, clearCurrentDocument]);

    // WebSocket Listeners: Real-time syncing and collaborator presence
    useEffect(() => {
        if (socket == null || quill == null) return;

        const handleReceiveChanges = (delta) => {
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

        // Listen for cursor selections of remote users
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

    // Handle Local Typing & Selection Movements
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

    // Autosave integration
    useEffect(() => {
        if (socket == null || quill == null) return;

        const handleSave = () => {
            setSavingStatus('Saving...');
            socket.emit('save-document', quill.getContents());
            setTimeout(() => setSavingStatus('Saved'), 800);
        };

        const textChangeHandler = (delta, oldDelta, source) => {
            if (source !== 'user') return;
            setSavingStatus('Unsaved Changes');
        };

        quill.on('text-change', textChangeHandler);

        const interval = setInterval(() => {
            if (savingStatus === 'Unsaved Changes') {
                handleSave();
            }
        }, 1500);

        return () => {
            quill.off('text-change', textChangeHandler);
            clearInterval(interval);
        };
    }, [socket, quill, savingStatus]);

    const handleTextChange = (contents, delta) => {
        if (socket == null) return;
        socket.emit('send-changes', delta);
    };

    if (!currentDocument) {
        return (
            <div className="flex h-screen items-center justify-center bg-brand-950">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent shadow-glow" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-brand-950">
            {/* Header Navbar */}
            <header className="h-16 px-6 glass flex items-center justify-between z-10 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="font-display font-semibold text-lg text-slate-100">{currentDocument.title}</h1>
                        <p className="text-xs text-slate-400">Created by {currentDocument.owner?.name}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Active User Avatar Bubbles */}
                    <div className="flex items-center -space-x-2 overflow-hidden">
                        {activeUsers.slice(0, 4).map((userProfile, idx) => (
                            <div 
                                key={idx} 
                                className="h-8 w-8 rounded-full border-2 border-brand-950 flex items-center justify-center text-xs font-bold text-white shadow-md select-none"
                                style={{ backgroundColor: userProfile.color || '#3b82f6' }}
                                title={`${userProfile.name} (${userProfile.email})`}
                            >
                                {userProfile.name.charAt(0).toUpperCase()}
                            </div>
                        ))}
                        {activeUsers.length > 4 && (
                            <div className="h-8 w-8 rounded-full bg-slate-800 border-2 border-brand-950 flex items-center justify-center text-xs font-semibold text-slate-300">
                                +{activeUsers.length - 4}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                        <Save className={`h-4 w-4 ${savingStatus === 'Saving...' ? 'animate-bounce text-brand-400' : 'text-slate-400'}`} />
                        {savingStatus}
                    </div>

                    {connected ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                            <Cloud className="h-4 w-4 animate-pulse" />
                            Live Sync
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold animate-pulse">
                            <CloudRain className="h-4 w-4" />
                            Reconnecting...
                        </div>
                    )}
                </div>
            </header>

            {/* Editor Canvas Wrapper with Absolute Cursor Layer Overlay */}
            <div className="flex-1 relative flex flex-col overflow-hidden">
                <Editor 
                    value={currentDocument.content} 
                    onChange={handleTextChange} 
                    onInit={(instance) => setQuill(instance)} 
                />

                {/* Remote Cursors Overlay Container */}
                <div className="absolute inset-0 pointer-events-none z-50 max-w-5xl w-full mx-auto px-4 md:px-8 py-4 mt-[55px]">
                    <div className="relative w-full h-full">
                        {Object.entries(remoteCursors).map(([socketId, { user: rUser, bounds }]) => (
                            <div 
                                key={socketId}
                                className="absolute transition-all duration-75"
                                style={{
                                    top: bounds.top,
                                    left: bounds.left + 25, // Align exact typing caret position
                                }}
                            >
                                {/* Vertical Cursor Bar */}
                                <div 
                                    className="w-[2px] h-[20px] relative animate-pulse"
                                    style={{ backgroundColor: rUser.color }}
                                >
                                    {/* Remote Username Tag Banner */}
                                    <div 
                                        className="absolute bottom-[20px] left-0 px-1.5 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap shadow-md select-none transform translate-y-[-2px]"
                                        style={{ backgroundColor: rUser.color }}
                                    >
                                        {rUser.name}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentWorkspace;
```

This completes your premium presence and remote cursor implementation! Next, we will secure our entire infrastructure by hardening websockets and APIs.
