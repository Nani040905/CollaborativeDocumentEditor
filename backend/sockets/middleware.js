import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import User from '../models/User.js';

export const authorizeSocket = async (socket, next) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie;
        if (!cookieHeader) {
            return next(new Error('Authentication Error: Missing credentials cookie.'));
        }

        const cookies = cookie.parse(cookieHeader);
        const token = cookies.token;

        if (!token) {
            return next(new Error('Authentication Error: Missing session token.'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return next(new Error('Authentication Error: User session has expired or is invalid.'));
        }

        socket.userProfile = {
            id: user._id.toString(),
            name: user.name,
            email: user.email
        };

        next();
    } catch (err) {
        return next(new Error(`Authentication Error: Unrecognized connection token. ${err.message}`));
    }
};
