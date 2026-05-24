import jwt from 'jsonwebtoken';
import cookie from 'cookie'; // Fast cookie-parsing library
import User from '../models/User.js';
import Document from '../models/Document.js';

const activeRooms = {};
const CURSOR_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6', '#06b6d4'];

// BIND SOCKET SECURITY HANDSHAKE MIDDLEWARE
export const authorizeSocket = async (socket, next) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie;
        if (!cookieHeader) {
            return next(new Error('Authentication Error: Missing credentials cookie.'));
        }

        // Parse cookie object
        const cookies = cookie.parse(cookieHeader);
        const token = cookies.token;

        if (!token) {
            return next(new Error('Authentication Error: Missing session token.'));
        }

        // Decode and verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return next(new Error('Authentication Error: User session has expired or is invalid.'));
        }

        // Mount authenticated user directly onto socket connection
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

const socketHandler = (io) => {
    // Inject security middleware into Socket.io pipeline
    io.use(authorizeSocket);

    io.on('connection', (socket) => {
        // Safe access: User is already securely validated!
        const user = socket.userProfile;
        console.log(`[Socket Secure Connected] user: ${user.name} | Socket ID: ${socket.id}`);

        socket.on('join-document', async ({ documentId }) => {
            if (!documentId) return;

            try {
                // Strict Room Security Database Check
                const doc = await Document.findById(documentId);
                if (!doc) {
                    return socket.emit('error', 'Document not found.');
                }

                // Check authorization
                const isOwner = doc.owner.toString() === user.id;
                const isCollaborator = doc.collaborators.some((c) => c.toString() === user.id);

                if (!isOwner && !isCollaborator) {
                    console.warn(`[Security Intrusion Alert] User ${user.name} attempted unauthorized access to doc ${documentId}`);
                    return socket.emit('unauthorized', 'Access denied. You are not authorized to view this document.');
                }

                // Put socket inside workspace
                socket.join(documentId);
                socket.documentId = documentId;
                
                const userColor = CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
                const userWithPresence = { ...user, color: userColor };
                socket.presence = userWithPresence;

                if (!activeRooms[documentId]) {
                    activeRooms[documentId] = {};
                }
                activeRooms[documentId][socket.id] = userWithPresence;

                socket.emit('active-users-list', Object.values(activeRooms[documentId]));
                socket.broadcast.to(documentId).emit('user-joined', userWithPresence);

                console.log(`[Socket Room Secure] User ${user.name} authorized in room ${documentId}`);
            } catch (err) {
                socket.emit('error', 'Failed to resolve database parameters.');
            }
        });

        socket.on('cursor-move', (range) => {
            const { documentId, presence } = socket;
            if (!documentId || !presence) return;

            socket.broadcast.to(documentId).emit('remote-cursor-move', {
                socketId: socket.id,
                user: presence,
                range
            });
        });

        socket.on('send-changes', (delta) => {
            const { documentId } = socket;
            if (documentId) {
                socket.broadcast.to(documentId).emit('receive-changes', delta);
            }
        });

        socket.on('save-document', async (content) => {
            const { documentId } = socket;
            if (documentId) {
                await Document.findByIdAndUpdate(documentId, { content });
            }
        });

        socket.on('disconnect', () => {
            const { documentId, presence } = socket;

            if (documentId && activeRooms[documentId]) {
                delete activeRooms[documentId][socket.id];
                if (Object.keys(activeRooms[documentId]).length === 0) {
                    delete activeRooms[documentId];
                } else {
                    io.to(documentId).emit('active-users-list', Object.values(activeRooms[documentId]));
                }
            }

            if (documentId && presence) {
                socket.broadcast.to(documentId).emit('user-left', socket.id);
            }
        });
    });
};

export default socketHandler;
