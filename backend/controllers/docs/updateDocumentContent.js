import Document from '../../models/Document.js';

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
