import Document from '../../models/Document.js';
import User from '../../models/User.js';

export const addCollaborator = async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;

    try {
        const doc = await Document.findById(id);

        if (!doc) {
            return res.status(404).json({ message: 'Document not found.' });
        }

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
