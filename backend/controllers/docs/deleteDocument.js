import Document from '../../models/Document.js';

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
