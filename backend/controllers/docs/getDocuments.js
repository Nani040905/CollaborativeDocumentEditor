import Document from '../../models/Document.js';

export const getDocuments = async (req, res) => {
    try {
        const documents = await Document.find({
            $or: [
                { owner: req.user._id },
                { collaborators: req.user._id }
            ]
        })
        .populate('owner', 'name email')
        .sort({ updatedAt: -1 });

        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ message: `Failed to fetch documents: ${error.message}` });
    }
};
