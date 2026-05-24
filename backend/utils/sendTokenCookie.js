import jwt from 'jsonwebtoken';

/**
 * Helper utility to sign a JSON Web Token (JWT) and dispatch it as an HTTP-only cookie.
 * @param {object} res - Express response handler object.
 * @param {string} userId - User document Object ID from MongoDB.
 */
export const sendTokenCookie = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};
