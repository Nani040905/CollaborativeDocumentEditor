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
