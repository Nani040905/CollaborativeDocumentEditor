import Document from '../models/Document.js';
import User from '../models/User.js';

// Create a new document
export const createDocument = async (req, res) => {
    const { title, content } = req.body;
    
    try {
        const newDoc = await Document.create({
            title: title || 'Untitled Document',
            content: content || '',
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

// Save a document's rich-text content (Owner or Collaborator)
export const updateDocumentContent = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

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

        doc.content = content || '';
        await doc.save();

        res.status(200).json(doc);
    } catch (error) {
        res.status(500).json({ message: `Failed to save document content: ${error.message}` });
    }
};
