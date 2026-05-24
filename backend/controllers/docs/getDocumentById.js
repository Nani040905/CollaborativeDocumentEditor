import Document from '../../models/Document.js';

export const getDocumentById = async (req, res) => {
    const { id } = req.params;

    try {
        const doc = await Document.findById(id)
            .populate('owner', 'name email')
            .populate('collaborators', 'name email');

        if (!doc) {
            return res.status(404).json({ message: 'Document not found.' });
        }

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
