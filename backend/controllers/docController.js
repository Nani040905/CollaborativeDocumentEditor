import Document from '../models/Document.js';
import User from '../models/User.js';

/**
 * Creates a new document.
 * Saves the document with default titles and sets the creator user as the Owner.
 * 
 * @param {import('express').Request} req - Express request with `title` and `content` in body, and `user` from auth.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>} 201 Created with new document payload.
 */
export const createDocument = async (req, res) => {
    const { title, content } = req.body;
    
    try {
        // Build and save a document record in MongoDB
        const newDoc = await Document.create({
            title: title || 'Untitled Document',
            content: content || '',
            owner: req.user._id, // Assign active creator user ID
            collaborators: [] // Starts empty of collaborators
        });

        res.status(201).json(newDoc);
    } catch (error) {
        res.status(500).json({ message: `Failed to create document: ${error.message}` });
    }
};

/**
 * Retrieves all documents owned by user OR where they are invited as a collaborator.
 * Employs Mongoose `.populate()` to inject owner profile objects (name, email)
 * and sorts them newest first.
 * 
 * @param {import('express').Request} req - Express request with `user` payload.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>} 200 OK with array of document objects.
 */
export const getDocuments = async (req, res) => {
    try {
        // Query MongoDB with OR logic targeting owner OR collaborator arrays matching user ID
        const documents = await Document.find({
            $or: [
                { owner: req.user._id },
                { collaborators: req.user._id }
            ]
        })
        .populate('owner', 'name email') // Inject owner details automatically
        .sort({ updatedAt: -1 }); // Sorted descending (newest edits first)

        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ message: `Failed to fetch documents: ${error.message}` });
    }
};

/**
 * Fetches a single document by its Object ID with detailed population.
 * Restricts access via an authorization firewall checking if the requesting user
 * is either the document owner or an invited collaborator.
 * 
 * @param {import('express').Request} req - Express request with document `id` in params.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>} 200 OK with full document data or 403/404 errors.
 */
export const getDocumentById = async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch target document by its MongoDB Object ID
        const doc = await Document.findById(id)
            .populate('owner', 'name email')
            .populate('collaborators', 'name email');

        // Fail if the document does not exist
        if (!doc) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        // Authorization firewall check: Assert user owns or is on the collaborators list
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

/**
 * Updates a document's title.
 * Restricts renaming permissions to either the Document Owner or active Collaborators.
 * 
 * @param {import('express').Request} req - Express request with `id` param and `title` body.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>} 200 OK with updated document or permission error.
 */
export const updateDocumentTitle = async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    try {
        const doc = await Document.findById(id);

        if (!doc) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        // Assert permissions
        const isOwner = doc.owner.toString() === req.user._id.toString();
        const isCollaborator = doc.collaborators.some(
            (c) => c.toString() === req.user._id.toString()
        );

        if (!isOwner && !isCollaborator) {
            return res.status(403).json({ message: 'Access denied. Unauthorized to modify this document.' });
        }

        // Apply clean strings and fallback to Untitled Document if empty
        doc.title = title || 'Untitled Document';
        await doc.save();

        res.status(200).json(doc);
    } catch (error) {
        res.status(500).json({ message: `Failed to rename document: ${error.message}` });
    }
};

/**
 * Deletes a document.
 * Strictly restricted to the Document Owner (collaborators cannot delete documents).
 * 
 * @param {import('express').Request} req - Express request with document `id`.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>} 200 OK on success or 403 if unauthorized.
 */
export const deleteDocument = async (req, res) => {
    const { id } = req.params;

    try {
        const doc = await Document.findById(id);

        if (!doc) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        // Strictly restrict deletes to the primary owner of the document
        if (doc.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied. Only the owner can delete this document.' });
        }

        // Commits permanent deletion from MongoDB collection
        await doc.deleteOne();
        res.status(200).json({ message: 'Document deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: `Failed to delete document: ${error.message}` });
    }
};

/**
 * Invites a collaborator by email address.
 * Looks up target profile inside Users database, and appends reference to the Document collaborators array.
 * Restricts invitations strictly to the primary Document Owner.
 * 
 * @param {import('express').Request} req - Express request with document `id` and collaborator `email`.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>} 200 OK on success or error on failure.
 */
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

        // Perform clean lookup case-insensitively
        const userToInvite = await User.findOne({ email: email.toLowerCase() });
        if (!userToInvite) {
            return res.status(404).json({ message: 'No registered user found with that email address.' });
        }

        // Check if the user is attempting to invite themselves
        if (userToInvite._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You are already the owner of this document.' });
        }

        // Check if the user is already on the collaborators list
        if (doc.collaborators.includes(userToInvite._id)) {
            return res.status(400).json({ message: 'This user is already a collaborator on this document.' });
        }

        // Append the user ID reference to the collaborative list and save
        doc.collaborators.push(userToInvite._id);
        await doc.save();

        res.status(200).json({ message: `${userToInvite.name} has been added successfully as a collaborator.` });
    } catch (error) {
        res.status(500).json({ message: `Invitation error: ${error.message}` });
    }
};

/**
 * Saves a document's rich-text content (Quill editor changes).
 * Restricts updates to either the Document Owner or active Collaborators.
 * 
 * @param {import('express').Request} req - Express request with `id` and `content`.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>} 200 OK on success.
 */
export const updateDocumentContent = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    try {
        const doc = await Document.findById(id);

        if (!doc) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        // Perform permission checks
        const isOwner = doc.owner.toString() === req.user._id.toString();
        const isCollaborator = doc.collaborators.some(
            (c) => c.toString() === req.user._id.toString()
        );

        if (!isOwner && !isCollaborator) {
            return res.status(403).json({ message: 'Access denied. Unauthorized to modify this document.' });
        }

        // Apply new content deltas and save
        doc.content = content || '';
        await doc.save();

        res.status(200).json(doc);
    } catch (error) {
        res.status(500).json({ message: `Failed to save document content: ${error.message}` });
    }
};

/**
 * Allows any authenticated user to join a document as an active editor/collaborator.
 * 
 * @param {import('express').Request} req - Express request containing the link `id`.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>} 200 OK after user is added to array.
 */
export const joinDocument = async (req, res) => {
    const { id } = req.params;

    try {
        const doc = await Document.findById(id);

        if (!doc) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        // If user is already the owner, succeed immediately
        if (doc.owner.toString() === req.user._id.toString()) {
            return res.status(200).json({ message: 'You are the owner of this document.' });
        }

        // If user is already on the collaborators list, succeed immediately
        if (doc.collaborators.includes(req.user._id)) {
            return res.status(200).json({ message: 'You are already a collaborator on this document.' });
        }

        // Append the user ID reference to the collaborative list and save
        doc.collaborators.push(req.user._id);
        await doc.save();

        res.status(200).json({ message: 'Successfully joined document as collaborator.' });
    } catch (error) {
        res.status(500).json({ message: `Failed to join document: ${error.message}` });
    }
};
