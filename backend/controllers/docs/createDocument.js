import Document from '../../models/Document.js';

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
