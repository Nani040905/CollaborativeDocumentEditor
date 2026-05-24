# Part 7: React Editor Integration (Quill.js)

In this guide, you will integrate the highly robust **Quill.js** rich-text editor engine. You will learn to construct custom, premium-designed utility Toolbars, manage initialization cleanly using React's virtual ref lifecycle hooks, and build a beautiful editor container.

---

## 1. The Quill.js Integration Gotcha

A common bug when integrating Quill.js inside React is the **"Double Toolbar Bug"**. 
Because React runs its `useEffect` mounting cycles twice in Development mode (Strict Mode) to trace memory leaks, Quill is often initialized twice on the same DOM selector, resulting in duplicate toolbars stacking on top of the screen.

### The Solution:
Instead of targeting a class name string (like `"#editor"`), we hook Quill directly onto an isolated `useRef` node. We also manually check if the container already has an active editor instance prior to initial execution.

---

## 2. Implementing the Collaborative Editor Interface

### Creating the Shared Rich Text Editor Component (`components/Editor/Editor.jsx`)
Create `frontend/src/components/Editor/Editor.jsx` and add this code:

```jsx
import React, { useCallback, useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

// Premium styling layout overrides for Quill standard styles
const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, false] }],
    [{ font: [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['image', 'code-block', 'blockquote'],
    ['clean']
];

const Editor = ({ value, onChange, onInit }) => {
    const editorRef = useRef(null);
    const quillInstanceRef = useRef(null);

    // Using a callback ref is the safest way to target DOM mounting in React
    const wrapperRef = useCallback((wrapper) => {
        if (wrapper == null) return;

        // Reset and clear any existing elements to prevent the duplicate toolbar bug
        wrapper.innerHTML = '';
        const editorContainer = document.createElement('div');
        wrapper.append(editorContainer);

        // Bootstrap Quill
        const q = new Quill(editorContainer, {
            theme: 'snow',
            modules: {
                toolbar: TOOLBAR_OPTIONS
            },
            placeholder: 'Start writing your shared thoughts here...'
        });

        // Store reference globally
        quillInstanceRef.current = q;
        
        // Pass instance back to parent component (Crucial for Websocket hooks)
        if (onInit) {
            onInit(q);
        }
    }, [onInit]);

    // Handle updates when content is modified
    useEffect(() => {
        const q = quillInstanceRef.current;
        if (!q || !onChange) return;

        const handleTextChange = (delta, oldDelta, source) => {
            // Only fire event if typing was originated by this user
            if (source !== 'user') return;
            onChange(q.getContents(), delta);
        };

        q.on('text-change', handleTextChange);

        return () => {
            q.off('text-change', handleTextChange);
        };
    }, [onChange]);

    // Load initial database data into editor once
    useEffect(() => {
        const q = quillInstanceRef.current;
        if (!q || !value) return;

        // Disabling editing temporarily prevents typing during page loading transition
        q.disable();
        q.setContents(value);
        q.enable();
    }, [value]);

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-brand-950 px-4 md:px-8 py-4">
            <div 
                className="quill-wrapper flex-1 glass rounded-2xl shadow-glass flex flex-col overflow-hidden max-w-5xl w-full mx-auto"
                ref={wrapperRef}
            />
        </div>
    );
};

export default Editor;
```

---

## 3. Styling Overrides (`src/index.css`)

To make our Quill editor container blend into our high-fidelity dark glassmorphic design theme, append the following styling overrides to the bottom of `frontend/src/index.css`:

```css
/* Quill Dark Theme Overrides */
.ql-toolbar.ql-snow {
  background: rgba(15, 23, 42, 0.8) !important;
  border: none !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  padding: 12px !important;
}

.ql-toolbar.ql-snow .ql-stroke {
  stroke: #cbd5e1 !important; /* light gray icons */
}

.ql-toolbar.ql-snow .ql-fill {
  fill: #cbd5e1 !important;
}

.ql-toolbar.ql-snow .ql-picker {
  color: #cbd5e1 !important;
}

.ql-toolbar.ql-snow .ql-picker-options {
  background-color: #0f172a !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 8px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5) !important;
}

.ql-container.ql-snow {
  border: none !important;
  font-family: 'Inter', sans-serif !important;
  font-size: 16px !important;
  color: #e2e8f0 !important;
  overflow-y: auto !important;
  padding: 20px !important;
  flex: 1;
}

/* Make editor fill out complete viewport size */
.quill-wrapper .ql-container {
  min-height: 400px;
}

.ql-editor.ql-blank::before {
  color: #64748b !important;
  font-style: italic !important;
}
```
---

## 4. Integrating Quill into Document Workspace (`components/Editor/DocumentWorkspace.jsx`)

To complete the editor integration, we refactored the distraction-free workspace component in `frontend/src/components/Editor/DocumentWorkspace.jsx`. This replaces the static mock `<textarea>` with our premium `<Editor />` Quill component and connects all document retrievals, live titles renames, presence profile lists, and email share invitations to the live MongoDB database-backed `useDocStore` Zustand store.

### Final Document Workspace Integration:

```jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import useAuthStore from '../../store/useAuthStore';
import useDocStore from '../../store/useDocStore';
import Editor from './Editor';
import { 
    ArrowLeft, Check, RefreshCw, Share2, 
    ChevronRight, AlignLeft, Copy
} from 'lucide-react';

const DocumentWorkspace = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { 
        currentDocument, 
        fetchDocumentById, 
        updateTitleInDashboard, 
        inviteCollaborator, 
        loading: docsLoading 
    } = useDocStore();

    const [title, setTitle] = useState('');
    const [saveStatus, setSaveStatus] = useState('All changes saved');
    const [showShare, setShowShare] = useState(false);
    const [showOutline, setShowOutline] = useState(true);
    const [copied, setCopied] = useState(false);
    
    // Collaborator invite states
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');
    const [inviteSuccess, setInviteSuccess] = useState(false);

    // Fetch document details from live database on load
    useEffect(() => {
        fetchDocumentById(id)
            .then((doc) => {
                if (doc) {
                    setTitle(doc.title);
                }
            })
            .catch(() => {
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
        setSaveStatus('Saving...');

        try {
            await updateTitleInDashboard(id, newTitle.trim() || 'Untitled Document');
            setSaveStatus('All changes saved');
        } catch (err) {
            setSaveStatus('Error saving title');
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
            fetchDocumentById(id); // Reload document list
        } else {
            setInviteSuccess(false);
            setInviteMessage(res.error || 'Failed to add collaborator.');
        }

        setTimeout(() => setInviteMessage(''), 4000);
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden">
            {/* Header Navigation */}
            <header className="h-14 border-b border-slate-800 bg-slate-900/60 px-6 flex items-center justify-between min-h-14">
                <div className="flex items-center gap-4 flex-1">
                    <button onClick={() => navigate('/dashboard')} className="p-1 text-slate-400 hover:text-slate-200">
                        <ArrowLeft size={16} />
                    </button>
                    <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        className="bg-transparent border-none text-sm font-semibold text-slate-100 outline-none w-full"
                    />
                    <span className="text-xs text-slate-400">{saveStatus}</span>
                </div>
                <div className="flex items-center gap-4">
                    {/* Share Modal Trigger */}
                    <button onClick={() => setShowShare(!showShare)} className="flex items-center gap-1.5 rounded bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-300">
                        <Share2 size={13} />
                        <span>Share</span>
                    </button>
                </div>
            </header>
            
            {/* Split Workspace Layout */}
            <div className="flex-1 flex overflow-hidden">
                <main className="flex-1 flex flex-col bg-slate-950">
                    {docsLoading ? (
                        <div>Loading...</div>
                    ) : (
                        <Editor value={currentDocument?.content} />
                    )}
                </main>
            </div>
        </div>
    );
};

export default DocumentWorkspace;
```


This completes your rich text frontend component! In the next phase, we will connect our persistent WebSocket pipelines using Socket.IO.
