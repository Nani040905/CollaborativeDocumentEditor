import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createDocument,
    getDocuments,
    getDocumentById,
    updateDocumentTitle,
    deleteDocument,
    addCollaborator,
    updateDocumentContent,
    joinDocument
} from '../controllers/docController.js';

const router = express.Router();

// Secure all CRUD endpoints behind auth validation (gateways verify token prior to routing)
router.use(protect);

// MERN Collaborative Document Endpoints:
router.post('/', createDocument);               // Create a new blank or custom document
router.get('/', getDocuments);                 // Fetch all documents owned or shared with active user
router.get('/:id', getDocumentById);           // Retrieve detailed fields of a specific document
router.put('/:id/title', updateDocumentTitle);   // Rename a specific document
router.put('/:id/content', updateDocumentContent); // Save rich-text delta contents
router.delete('/:id', deleteDocument);           // Delete a document (Restricted to Owner)
router.post('/:id/collaborators', addCollaborator); // Invite a collaborator by email lookup
router.post('/:id/join', joinDocument);           // Join a document using a shareable invite link

export default router;
