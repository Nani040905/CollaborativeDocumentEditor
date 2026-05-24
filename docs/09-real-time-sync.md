# Part 9: Real-time Document Syncing

In this guide, you will build the central synchronization engine. You will learn how Quill JSON Deltas function as operational changes, establish the Socket event routing pipelines on the server, and write the React hooks to apply operational changes locally without disrupting user keyboard inputs.

---

## 1. Demystifying Quill JSON Deltas

Rather than sending the entire document string back and forth every time a user types a single key (which would destroy bandwidth and cause editing race conditions), Quill uses **Deltas** to describe document modifications.

A Delta is a JSON array of operations:
* **`insert`**: Inject characters with custom formatting attributes.
* **`retain`**: Keep a set number of characters unchanged.
* **`delete`**: Remove a set number of characters.

### Example:
If you have the text `"Hello World"` and type `"!"` at the end, Quill outputs a Delta:
```json
{
  "ops": [
    { "retain": 11 },
    { "insert": "!" }
  ]
}
```
If you change the word `"Hello"` to bold, the Delta is:
```json
{
  "ops": [
    { "retain": 5, "attributes": { "bold": true } }
  ]
}
```
We broadcast these mini-JSON packages across WebSockets so other users' editors can apply *exactly* the same changes at *exactly* the same locations.

---

## 2. Server-Side Broadcast Routing

Let's add the event listener to catch and broadcast editor updates.

### Updating Socket Broker (`sockets/socketHandler.js`)
Modify `backend/sockets/socketHandler.js` to incorporate the `send-changes` pipeline:

```javascript
const socketHandler = (io) => {
    io.on('connection', (socket) => {
        
        socket.on('join-document', ({ documentId, user }) => {
            socket.join(documentId);
            socket.documentId = documentId;
            socket.user = user;
            socket.broadcast.to(documentId).emit('user-joined', user);
        });

        // 1. LISTEN for changes sent from a typing client
        socket.on('send-changes', (delta) => {
            const { documentId } = socket;
            if (!documentId) return;

            // 2. BROADCAST the delta to all other editors in the room
            socket.broadcast.to(documentId).emit('receive-changes', delta);
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

## 3. Client-Side Real-Time Integration

Now we bind the editor triggers inside our parent Workspace component.

### Building Workspace Container (`components/Editor/DocumentWorkspace.jsx`)
Create the file `frontend/src/components/Editor/DocumentWorkspace.jsx` and insert this code:

```jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Cloud, CloudRain } from 'lucide-react';
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

    // Load document metadata from REST on mount
    useEffect(() => {
        fetchDocumentById(documentId).catch(() => {
            navigate('/dashboard'); // Kick out if file access failed
        });

        return () => {
            clearCurrentDocument();
        };
    }, [documentId, fetchDocumentById, navigate, clearCurrentDocument]);

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

    // Track local typing and emit changes over WebSockets
    const handleTextChange = (contents, delta) => {
        if (socket == null) return;
        
        // Broadcast change operations to all other active editors
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

This completes your real-time synchronization architecture! In the next section, we will implement the autosave pipeline to persist document data back into MongoDB safely.
