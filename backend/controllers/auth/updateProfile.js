import User from '../../models/User.js';

export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (req.body.name) {
            user.name = req.body.name.trim();
        }

        await user.save();
        res.status(200).json({
            message: 'Profile updated successfully',
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: `Profile update error: ${error.message}` });
    }
};
