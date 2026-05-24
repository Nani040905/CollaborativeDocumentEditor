# Part 6: Document CRUD REST APIs & Dashboard Store

In this guide, you will implement secure backend REST APIs for creating, reading, updating, and deleting documents, along with strict permissions (collaborator checks and owner-only delete constraints). You will also create a matching Zustand store to power your document dashboard.

---

## 1. Backend REST Document Logic

### Developing Document Controllers (`controllers/docController.js`)
Create the file `backend/controllers/docController.js` and paste this complete implementation:

```javascript
import Document from '../models/Document.js';
import User from '../models/User.js';

// Create a blank document
export const createDocument = async (req, res) => {
    try {
        const newDoc = await Document.create({
            title: 'Untitled Document',
            content: '',
            owner: req.user._id,
            collaborators: []
        });

        res.status(201).json(newDoc);
    } catch (error) {
        res.status(500).json({ message: `Failed to create document: ${error.message}` });
    }
};

// Retrieve all documents owned by user OR where they are a collaborator
export const getDocuments = async (req, res) => {
    try {
        const documents = await Document.find({
            $or: [
                { owner: req.user._id },
                { collaborators: req.user._id }
            ]
        })
        .populate('owner', 'name email') // Inject owner profiles
        .sort({ updatedAt: -1 }); // Sorted newest first

        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ message: `Failed to fetch documents: ${error.message}` });
    }
};

// Fetch a single document with detailed population
export const getDocumentById = async (req, res) => {
    const { id } = req.params;

    try {
        const doc = await Document.findById(id)
            .populate('owner', 'name email')
            .populate('collaborators', 'name email');

        if (!doc) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        // Authorization firewall check
        const isOwner = doc.owner._id.toString() === req.user._id.toString();
        const isCollaborator = doc.collaborators.some(
            (c) => c._id.toString() === req.user._id.toString()
        );

        if (!isOwner && !isCollaborator) {
            return res.status(403).json({ message: 'Access denied. You do not have permission to view this document.' });
        }

        res.status(200).json(doc);
    } catch (error) {
        res.status(500).json({ message: `Failed to fetch document details: ${error.message}` });
    }
};

// Update a document's title (Owner or Collaborator)
export const updateDocumentTitle = async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    try {
        const doc = await Document.findById(id);

        if (!doc) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        const isOwner = doc.owner.toString() === req.user._id.toString();
        const isCollaborator = doc.collaborators.some(
            (c) => c.toString() === req.user._id.toString()
        );

        if (!isOwner && !isCollaborator) {
            return res.status(403).json({ message: 'Access denied. Unauthorized to modify this document.' });
        }

        doc.title = title || 'Untitled Document';
        await doc.save();

        res.status(200).json(doc);
    } catch (error) {
        res.status(500).json({ message: `Failed to rename document: ${error.message}` });
    }
};

// Delete a document (Strictly restricted to Owner)
export const deleteDocument = async (req, res) => {
    const { id } = req.params;

    try {
        const doc = await Document.findById(id);

        if (!doc) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        if (doc.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied. Only the owner can delete this document.' });
        }

        await doc.deleteOne();
        res.status(200).json({ message: 'Document deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: `Failed to delete document: ${error.message}` });
    }
};

// Add a collaborator by Email lookup
export const addCollaborator = async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;

    try {
        const doc = await Document.findById(id);

        if (!doc) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        // Only the owner can add/invite collaborators
        if (doc.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the document owner can invite collaborators.' });
        }

        const userToInvite = await User.findOne({ email: email.toLowerCase() });
        if (!userToInvite) {
            return res.status(404).json({ message: 'No registered user found with that email address.' });
        }

        if (userToInvite._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You are already the owner of this document.' });
        }

        if (doc.collaborators.includes(userToInvite._id)) {
            return res.status(400).json({ message: 'This user is already a collaborator on this document.' });
        }

        doc.collaborators.push(userToInvite._id);
        await doc.save();

        res.status(200).json({ message: `${userToInvite.name} has been added successfully as a collaborator.` });
    } catch (error) {
        res.status(500).json({ message: `Invitation error: ${error.message}` });
    }
};
```

### Mapping Routes (`routes/docRoutes.js`)
Replace `backend/routes/docRoutes.js` with the clean modular mappings:

```javascript
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createDocument,
    getDocuments,
    getDocumentById,
    updateDocumentTitle,
    deleteDocument,
    addCollaborator
} from '../controllers/docController.js';

const router = express.Router();

// Secure all CRUD endpoints behind auth validation
router.use(protect);

router.post('/', createDocument);
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.put('/:id/title', updateDocumentTitle);
router.delete('/:id', deleteDocument);
router.post('/:id/collaborators', addCollaborator);

export default router;
```

> [!TIP]
> Make sure to import this router inside your main `server.js` and mount it:
> `app.use('/api/documents', docRoutes);`

---

## 2. Frontend Document Store (Zustand)

### Creating Zustand Store (`store/useDocStore.js`)
Create the file `frontend/src/store/useDocStore.js` and add this code:

```javascript
import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const useDocStore = create((set, get) => ({
    documents: [],
    currentDocument: null,
    loading: false,
    error: null,

    fetchDocuments: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axios.get(`${API_URL}/documents`);
            set({ documents: res.data, loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Error fetching documents', loading: false });
        }
    },

    fetchDocumentById: async (id) => {
        set({ loading: true, error: null });
        try {
            const res = await axios.get(`${API_URL}/documents/${id}`);
            set({ currentDocument: res.data, loading: false });
            return res.data;
        } catch (err) {
            const msg = err.response?.data?.message || 'Error loading document';
            set({ error: msg, loading: false, currentDocument: null });
            throw new Error(msg);
        }
    },

    createDocument: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axios.post(`${API_URL}/documents`);
            // Add new document to dashboard instantly
            set((state) => ({ 
                documents: [res.data, ...state.documents], 
                loading: false 
            }));
            return res.data;
        } catch (err) {
            set({ error: 'Error generating new document', loading: false });
            return null;
        }
    },

    deleteDocument: async (id) => {
        set({ error: null });
        try {
            await axios.delete(`${API_URL}/documents/${id}`);
            // Filter deleted document out of local memory state instantly
            set((state) => ({
                documents: state.documents.filter((doc) => doc._id !== id)
            }));
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to delete file';
            set({ error: msg });
            return { success: false, error: msg };
        }
    },

    updateTitleInDashboard: async (id, title) => {
        try {
            await axios.put(`${API_URL}/documents/${id}/title`, { title });
            set((state) => ({
                documents: state.documents.map((doc) => 
                    doc._id === id ? { ...doc, title } : doc
                )
            }));
        } catch (err) {
            set({ error: 'Failed to update title' });
        }
    },

    inviteCollaborator: async (id, email) => {
        set({ error: null });
        try {
            const res = await axios.post(`${API_URL}/documents/${id}/collaborators`, { email });
            return { success: true, message: res.data.message };
        } catch (err) {
            const msg = err.response?.data?.message || 'Invitation failed';
            set({ error: msg });
            return { success: false, error: msg };
        }
    },

    clearCurrentDocument: () => set({ currentDocument: null })
}));

export default useDocStore;
```

This establishes our fully authenticated document controller system. In the next guide, we will build out the beautiful Quill.js Rich Text Editor engine on our client side!
