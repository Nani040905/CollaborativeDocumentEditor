import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Zustand global document workspace store.
 * Coordinates all MERN database queries, handles CRUD requests for collaborative items,
 * processes offline memory filters, and binds live title/content updates.
 */
const useDocStore = create((set, get) => ({
    documents: [],            // User document records visible in active dashboard listings
    currentDocument: null,    // The active document loaded inside editor workspaces
    loading: false,           // Document loading state indicator
    error: null,              // Document API feedback errors

    /**
     * Retrieves all documents owned or shared with the active user.
     */
    fetchDocuments: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axios.get(`${API_URL}/documents`, { withCredentials: true });
            set({ documents: res.data, loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Error fetching documents', loading: false });
        }
    },

    /**
     * Fetches detailed fields of a specific document by its ID.
     * @param {string} id - Document Object ID.
     * @returns {Promise<object>} Stored document profile.
     */
    fetchDocumentById: async (id) => {
        set({ loading: true, error: null });
        try {
            const res = await axios.get(`${API_URL}/documents/${id}`, { withCredentials: true });
            set({ currentDocument: res.data, loading: false });
            return res.data;
        } catch (err) {
            const msg = err.response?.data?.message || 'Error loading document';
            set({ error: msg, loading: false, currentDocument: null });
            throw new Error(msg);
        }
    },

    /**
     * Spawns a new blank document sheet in the database.
     * @param {string} title - Default document title.
     * @param {string} content - Initial document content.
     * @returns {Promise<object>} Created document instance.
     */
    createDocument: async (title = 'Untitled Document', content = '') => {
        set({ loading: true, error: null });
        try {
            const res = await axios.post(`${API_URL}/documents`, { title, content }, { withCredentials: true });
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

    /**
     * Permantently deletes a document from user space (restricted to Owners).
     * @param {string} id - Document Object ID.
     * @returns {Promise<{success: boolean, error?: string}>} Delete results.
     */
    deleteDocument: async (id) => {
        set({ error: null });
        try {
            await axios.delete(`${API_URL}/documents/${id}`, { withCredentials: true });
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

    /**
     * Dispatch inline title updates to backend and sync locally.
     * @param {string} id - Document Object ID.
     * @param {string} title - New document title.
     */
    updateTitleInDashboard: async (id, title) => {
        try {
            await axios.put(`${API_URL}/documents/${id}/title`, { title }, { withCredentials: true });
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
     * Invites a teammate as editor by their email lookup.
     * @param {string} id - Document Object ID.
     * @param {string} email - Email query parameter.
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
     * Commits editor rich text changes (manual/autosave deltas) directly back to database content collections.
     * @param {string} id - Document Object ID.
     * @param {string|object} content - Quill rich text data.
     * @returns {Promise<{success: boolean}>} Sync results.
     */
    updateContent: async (id, content) => {
        try {
            const res = await axios.put(`${API_URL}/documents/${id}/content`, { content }, { withCredentials: true });
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

    // Purges cached editor workspace states
    clearCurrentDocument: () => set({ currentDocument: null })
}));

export default useDocStore;
