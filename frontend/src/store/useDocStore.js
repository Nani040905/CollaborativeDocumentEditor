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
            const res = await axios.get(`${API_URL}/documents`, { withCredentials: true });
            set({ documents: res.data, loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Error fetching documents', loading: false });
        }
    },

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

    clearCurrentDocument: () => set({ currentDocument: null })
}));

export default useDocStore;
