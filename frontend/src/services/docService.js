import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

export const docService = {
    fetchDocuments: () => axios.get(`${API_URL}/documents`),
    fetchDocumentById: (id) => axios.get(`${API_URL}/documents/${id}`),
    createDocument: (title, content) => axios.post(`${API_URL}/documents`, { title, content }),
    deleteDocument: (id) => axios.delete(`${API_URL}/documents/${id}`),
    updateTitle: (id, title) => axios.put(`${API_URL}/documents/${id}/title`, { title }),
    inviteCollaborator: (id, email) => axios.post(`${API_URL}/documents/${id}/collaborators`, { email }),
    updateContent: (id, content) => axios.put(`${API_URL}/documents/${id}/content`, { content })
};
