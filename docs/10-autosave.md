# Part 10: Auto-saving Document Content

In this guide, you will design a high-frequency, optimized **Autosave Engine** using debouncing. You will prevent database throttling by throttling write executions on the frontend, establish a WebSocket persistence layer on the backend, and add visual saving indicators.

---

## 1. The Performance Challenge: Typing vs DB Writes

If a user types at 80 words per minute, they generate roughly 6 keystrokes per second. 
* If you execute a database write to MongoDB on **every single keystroke**, 10 active users will generate **60 write operations per second**!
* This will throttle your database, increase CPU usage, trigger memory exhaustion, and cause latency spikes.

### The Solution: Debouncing
We set up a **Debounce Delay** (typically 1.5 seconds). We listen to keypresses and delay the database write. Each new keystroke cancels the previous pending timer and starts a new one. The database write only runs once the user pauses typing for 1.5 seconds.

---

## 2. Server-Side Persistence Handler

Let's configure our socket engine to listen for `save-document` packets and write them to MongoDB.

### Updating Socket Router (`sockets/socketHandler.js`)
Add the `save-document` event listener inside `backend/sockets/socketHandler.js`:

```javascript
import Document from '../models/Document.js';

const socketHandler = (io) => {
    io.on('connection', (socket) => {
        
        socket.on('join-document', ({ documentId, user }) => {
            socket.join(documentId);
            socket.documentId = documentId;
            socket.user = user;
            socket.broadcast.to(documentId).emit('user-joined', user);
        });

        socket.on('send-changes', (delta) => {
            const { documentId } = socket;
            if (documentId) {
                socket.broadcast.to(documentId).emit('receive-changes', delta);
            }
        });

        // SAVE DOCUMENT PERSISTENCE HANDLER
        socket.on('save-document', async (content) => {
            const { documentId } = socket;
            if (!documentId) return;

            try {
                // Persist detailed editor JSON Deltas into MongoDB
                await Document.findByIdAndUpdate(documentId, { content });
                console.log(`[Autosave] Document ${documentId} persisted successfully.`);
            } catch (error) {
                console.error(`[Autosave Error] Failed to save document ${documentId}:`, error.message);
            }
        });

        socket.on('disconnect', () => {
            const { documentId, user } = socket;
            if (documentId && user) {
                socket.broadcast.to(documentId).emit('user-left', user);
            }
        });
    });
};

export default socketHandler;
```

---

## 3. Client-Side Debounced Save Hook

Now we integrate the autosave logic into our React Workspace, complete with an elegant loading status bar.

### Updating Workspace Component (`components/Editor/DocumentWorkspace.jsx`)
Update your `frontend/src/components/Editor/DocumentWorkspace.jsx` file to include the debounced timer:

```jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Cloud, CloudRain, Save } from 'lucide-react';
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
    const [savingStatus, setSavingStatus] = useState('Saved'); // 'Saved', 'Saving...', 'Error'

    useEffect(() => {
        fetchDocumentById(documentId).catch(() => {
            navigate('/dashboard');
        });
        return () => {
            clearCurrentDocument();
        };
    }, [documentId, fetchDocumentById, navigate, clearCurrentDocument]);

    // Handle Socket sync
    useEffect(() => {
        if (socket == null || quill == null) return;

        const handleReceiveChanges = (delta) => {
            quill.updateContents(delta);
        };

        socket.on('receive-changes', handleReceiveChanges);

        return () => {
            socket.off('receive-changes', handleReceiveChanges);
        };
    }, [socket, quill]);

    // Debounced autosave effect
    useEffect(() => {
        if (socket == null || quill == null) return;

        // Auto-triggers save whenever text-changes occur after a delay
        const handleSave = () => {
            setSavingStatus('Saving...');
            
            // Get full editor JSON representation
            const content = quill.getContents();
            
            // Emit save event over Socket pipeline
            socket.emit('save-document', content);
            
            setTimeout(() => {
                setSavingStatus('Saved');
            }, 800);
        };

        const textChangeHandler = (delta, oldDelta, source) => {
            if (source !== 'user') return;
            setSavingStatus('Unsaved Changes');
        };

        quill.on('text-change', textChangeHandler);

        // Debounce: Wait 1.5 seconds after typing stops before executing DB save
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

                <div className="flex items-center gap-3">
                    {/* Dynamic Autosave Badge */}
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

            {/* Rich Editor Canvas */}
            <Editor 
                value={currentDocument.content} 
                onChange={handleTextChange} 
                onInit={(instance) => setQuill(instance)} 
            />
        </div>
    );
};

export default DocumentWorkspace;
```

This completes your high-performance autosave structure! In the next module, we will implement custom multi-user collaboration presence tracking and remote cursors.
