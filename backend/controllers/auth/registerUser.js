import User from '../../models/User.js';
import { sendTokenCookie } from '../../utils/sendTokenCookie.js';

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }

        const user = await User.create({ name, email, password });
        sendTokenCookie(res, user._id);

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: `Registration error: ${error.message}` });
    }
};
