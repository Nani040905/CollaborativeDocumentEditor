import { create } from 'zustand';
import axios from 'axios';

// Resolve backend API URL from Vite environment variables or fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Zustand global document workspace store.
 * Coordinates all MERN database queries, handles CRUD requests for collaborative items,
 * processes offline memory filters, and binds live title/content updates.
 * 
 * @module useDocStore
 */
const useDocStore = create((set, get) => ({
    // ---- Store State Fields ----

    // Array of all document records visible in active dashboard listings
    documents: [],            
    // The currently active document profile loaded inside the Editor workspace
    currentDocument: null,    
    // Global loading state flag for UI spinners
    loading: false,           
    // String message representing the most recent document API failure
    error: null,              

    // ---- Store Action Methods ----

    /**
     * Dashboard Initialization Method.
     * Retrieves all documents owned by or shared with the active user.
     */
    fetchDocuments: async () => {
        // Activate UI spinners
        set({ loading: true, error: null });
        try {
            // Retrieve documents from protected API endpoint
            const res = await axios.get(`${API_URL}/documents`, { withCredentials: true });
            // Populate store with array of documents returned from server
            set({ documents: res.data, loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Error fetching documents', loading: false });
        }
    },

    /**
     * Editor Initialization Method.
     * Fetches detailed fields (including rich-text content) of a specific document by its ID.
     * Used when navigating into a document workspace.
     * 
     * @param {string} id - Document Object ID.
     * @returns {Promise<object>} Stored document profile.
     */
    fetchDocumentById: async (id) => {
        set({ loading: true, error: null });
        try {
            // Retrieve detailed payload for the specific document
            const res = await axios.get(`${API_URL}/documents/${id}`, { withCredentials: true });
            // Inject document into `currentDocument` state for the Editor to consume
            set({ currentDocument: res.data, loading: false });
            return res.data;
        } catch (err) {
            // Document might be deleted or user permissions might be revoked
            const msg = err.response?.data?.message || 'Error loading document';
            set({ error: msg, loading: false, currentDocument: null });
            throw new Error(msg); // Bubble error to component so it can trigger a redirect
        }
    },

    /**
     * Document Generation Method.
     * Spawns a new blank document sheet in the database.
     * 
     * @param {string} title - Default document title.
     * @param {string} content - Initial document content template.
     * @returns {Promise<object>} Created document instance.
     */
    createDocument: async (title = 'Untitled Document', content = '') => {
        set({ loading: true, error: null });
        try {
            const res = await axios.post(`${API_URL}/documents`, { title, content }, { withCredentials: true });
            
            // Optimistic local update: Add new document to dashboard instantly
            // Prepend new document to the start of the `documents` array state
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

    /**
     * Deletion Method.
     * Permanently deletes a document from user space. The backend restricts this action to Owners only.
     * 
     * @param {string} id - Document Object ID.
     * @returns {Promise<{success: boolean, error?: string}>} Delete results.
     */
    deleteDocument: async (id) => {
        set({ error: null });
        try {
            await axios.delete(`${API_URL}/documents/${id}`, { withCredentials: true });
            
            // Optimistic local update: Filter deleted document out of local memory state instantly
            // Avoids needing a full re-fetch of all documents
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

    /**
     * Live Renaming Method.
     * Dispatch inline title updates to backend and sync locally across lists.
     * 
     * @param {string} id - Document Object ID.
     * @param {string} title - New document title.
     */
    updateTitleInDashboard: async (id, title) => {
        try {
            await axios.put(`${API_URL}/documents/${id}/title`, { title }, { withCredentials: true });
            
            // Sync new title into the dashboard list dynamically
            set((state) => ({
                documents: state.documents.map((doc) => 
                    doc._id === id ? { ...doc, title } : doc
                )
            }));
        } catch (err) {
            set({ error: 'Failed to update title' });
        }
    },

    /**
     * Sharing & Collaboration Method.
     * Invites a teammate as a new editor by querying their registered email address.
     * 
     * @param {string} id - Document Object ID.
     * @param {string} email - Email query parameter of the target user.
     * @returns {Promise<{success: boolean, message?: string, error?: string}>} Invite results.
     */
    inviteCollaborator: async (id, email) => {
        set({ error: null });
        try {
            const res = await axios.post(`${API_URL}/documents/${id}/collaborators`, { email }, { withCredentials: true });
            return { success: true, message: res.data.message };
        } catch (err) {
            const msg = err.response?.data?.message || 'Invitation failed';
            set({ error: msg });
            return { success: false, error: msg };
        }
    },

    /**
     * Persistent Content Saver Method.
     * Commits editor rich text changes (manual or autosave deltas) directly back to database content collections.
     * Serves as the reliable HTTP fallback mechanism if WebSockets fail.
     * 
     * @param {string} id - Document Object ID.
     * @param {string|object} content - Quill rich text data structure.
     * @returns {Promise<{success: boolean}>} Sync results.
     */
    updateContent: async (id, content) => {
        try {
            const res = await axios.put(`${API_URL}/documents/${id}/content`, { content }, { withCredentials: true });
            
            // Update the locally cached document in lists and current workspace viewer
            set((state) => ({
                documents: state.documents.map((doc) => 
                    doc._id === id ? { ...doc, content } : doc
                ),
                currentDocument: state.currentDocument?._id === id ? res.data : state.currentDocument
            }));
            return { success: true };
        } catch (err) {
            set({ error: 'Failed to save document content' });
            return { success: false };
        }
    },

    /**
     * Memory Cleanup Method.
     * Purges cached editor workspace states to prevent showing stale data when swapping documents.
     */
    clearCurrentDocument: () => set({ currentDocument: null })
}));

export default useDocStore;
