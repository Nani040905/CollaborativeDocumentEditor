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

// Initialize an Express router instance for document-related endpoints
const router = express.Router();

// Secure all CRUD endpoints behind auth validation
// This middleware runs before any of the routes below, verifying the JWT cookie
router.use(protect);

// ==========================================
// Protected Document Management Routes
// ==========================================

/**
 * @route POST /api/documents/
 * @desc Creates a new blank or predefined collaborative document
 * @access Private
 */
router.post('/', createDocument);

/**
 * @route GET /api/documents/
 * @desc Fetches a list of all documents where the user is either owner or collaborator
 * @access Private
 */
router.get('/', getDocuments);

/**
 * @route GET /api/documents/:id
 * @desc Retrieves full data (including content delta) for a specific document
 * @access Private (User must be owner or invited collaborator)
 */
router.get('/:id', getDocumentById);

/**
 * @route PUT /api/documents/:id/title
 * @desc Renames the title of a specific document
 * @access Private (User must be owner or invited collaborator)
 */
router.put('/:id/title', updateDocumentTitle);

/**
 * @route PUT /api/documents/:id/content
 * @desc Saves/updates the rich-text JSON delta content of the document
 * @access Private (User must be owner or invited collaborator)
 */
router.put('/:id/content', updateDocumentContent);

/**
 * @route DELETE /api/documents/:id
 * @desc Permanently deletes a document and its contents
 * @access Private (Strictly limited to the Document Owner)
 */
router.delete('/:id', deleteDocument);

/**
 * @route POST /api/documents/:id/collaborators
 * @desc Invites a new collaborator to the document via their email lookup
 * @access Private (Restricted to Document Owner)
 */
router.post('/:id/collaborators', addCollaborator);

/**
 * @route POST /api/documents/:id/join
 * @desc Allows a user to join a document workspace using a shareable invite link ID
 * @access Private
 */
router.post('/:id/join', joinDocument);

export default router;
