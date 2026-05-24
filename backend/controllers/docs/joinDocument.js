import Document from '../../models/Document.js';

export const joinDocument = async (req, res) => {
    const { id } = req.params;

    try {
        const doc = await Document.findById(id);

        if (!doc) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        if (doc.owner.toString() === req.user._id.toString()) {
            return res.status(200).json({ message: 'You are the owner of this document.' });
        }

        if (doc.collaborators.includes(req.user._id)) {
            return res.status(200).json({ message: 'You are already a collaborator on this document.' });
        }

        doc.collaborators.push(req.user._id);
        await doc.save();

        res.status(200).json({ message: 'Successfully joined document as collaborator.' });
    } catch (error) {
        res.status(500).json({ message: `Failed to join document: ${error.message}` });
    }
};
