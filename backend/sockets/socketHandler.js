import jwt from 'jsonwebtoken';
import cookie from 'cookie'; // Fast cookie-parsing library
import User from '../models/User.js';
import Document from '../models/Document.js';

// In-memory store mapping document IDs to a dictionary of active socket connections
const activeRooms = {};

// Tailwind-inspired color palette for assigning unique remote cursor colors to users
const CURSOR_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6', '#06b6d4'];

/**
 * Socket.IO Security Handshake Middleware.
 * Intercepts incoming WebSocket connection attempts to verify HTTP-only JWT cookies.
 * 
 * @param {import('socket.io').Socket} socket - The incoming socket connection object.
 * @param {Function} next - Callback to allow connection or reject with an Error.
 */
export const authorizeSocket = async (socket, next) => {
    try {
        // Retrieve raw cookie string from handshake headers
        const cookieHeader = socket.handshake.headers.cookie;
        if (!cookieHeader) {
            return next(new Error('Authentication Error: Missing credentials cookie.'));
        }

        // Parse cookie object to extract the JWT token
        const cookies = cookie.parse(cookieHeader);
        const token = cookies.token;

        if (!token) {
            return next(new Error('Authentication Error: Missing session token.'));
        }

        // Decode and verify JWT using server secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch user from database to ensure account is still active
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return next(new Error('Authentication Error: User session has expired or is invalid.'));
        }

        // Mount authenticated user directly onto socket connection for downstream event handlers
        socket.userProfile = {
            id: user._id.toString(),
            name: user.name,
            email: user.email
        };

        // Approve the connection
        next();
    } catch (err) {
        return next(new Error(`Authentication Error: Unrecognized connection token. ${err.message}`));
    }
};

/**
 * Initializes and binds all real-time Socket.IO event handlers.
 * 
 * @param {import('socket.io').Server} io - The global Socket.IO server instance.
 */
const socketHandler = (io) => {
    // Inject security middleware into Socket.io pipeline before any connections are accepted
    io.use(authorizeSocket);

    // Fired when a client successfully connects and passes authorization
    io.on('connection', (socket) => {
        // Safe access: User is already securely validated by the middleware!
        const user = socket.userProfile;
        console.log(`[Socket Secure Connected] user: ${user.name} | Socket ID: ${socket.id}`);

        /**
         * Event: 'join-document'
         * @desc Authenticates user access to a specific document and joins them to the Socket.IO room.
         * @param {Object} payload - Contains the `documentId` to join.
         */
        socket.on('join-document', async ({ documentId }) => {
            if (!documentId) return;

            try {
                // Strict Room Security Database Check
                const doc = await Document.findById(documentId);
                if (!doc) {
                    return socket.emit('error', 'Document not found.');
                }

                // Verify user has ownership or collaborator permissions
                const isOwner = doc.owner.toString() === user.id;
                const isCollaborator = doc.collaborators.some((c) => c.toString() === user.id);

                if (!isOwner && !isCollaborator) {
                    console.warn(`[Security Intrusion Alert] User ${user.name} attempted unauthorized access to doc ${documentId}`);
                    return socket.emit('unauthorized', 'Access denied. You are not authorized to view this document.');
                }

                // Put socket inside the specific document's workspace room
                socket.join(documentId);
                socket.documentId = documentId; // Cache ID on socket for disconnect events
                
                // Assign a random color for the user's remote cursor
                const userColor = CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
                const userWithPresence = { ...user, color: userColor };
                socket.presence = userWithPresence; // Cache presence data on socket

                // Track active users in memory
                if (!activeRooms[documentId]) {
                    activeRooms[documentId] = {};
                }
                activeRooms[documentId][socket.id] = userWithPresence;

                // Broadcast updated user list to everyone in the room (including the new user)
                socket.emit('active-users-list', Object.values(activeRooms[documentId]));
                // Broadcast to everyone else that a new user joined
                socket.broadcast.to(documentId).emit('user-joined', userWithPresence);

                console.log(`[Socket Room Secure] User ${user.name} authorized in room ${documentId}`);
            } catch (err) {
                socket.emit('error', 'Failed to resolve database parameters.');
            }
        });

        /**
         * Event: 'cursor-move'
         * @desc Receives local cursor coordinates and broadcasts them to all other collaborators.
         * @param {Object} range - Quill editor cursor range (index and length).
         */
        socket.on('cursor-move', (range) => {
            const { documentId, presence } = socket;
            if (!documentId || !presence) return;

            // Broadcast cursor movement to all OTHER users in the same document room
            socket.broadcast.to(documentId).emit('remote-cursor-move', {
                socketId: socket.id,
                user: presence,
                range
            });
        });

        /**
         * Event: 'send-changes'
         * @desc Receives rich-text delta changes and broadcasts them to peers for real-time sync.
         * @param {Object} delta - The Quill JSON delta representing the change.
         */
        socket.on('send-changes', (delta) => {
            const { documentId } = socket;
            if (documentId) {
                // Relay changes to everyone else in the room
                socket.broadcast.to(documentId).emit('receive-changes', delta);
            }
        });

        /**
         * Event: 'save-document'
         * @desc Periodically fired by the client to persist the document to MongoDB.
         * @param {Object} content - The full document JSON representation.
         */
        socket.on('save-document', async (content) => {
            const { documentId } = socket;
            if (documentId) {
                // Fire-and-forget save to database
                await Document.findByIdAndUpdate(documentId, { content });
            }
        });

        /**
         * Event: 'disconnect'
         * @desc Fired automatically when the client closes the browser or loses connection.
         * Cleans up in-memory presence tracking and notifies peers.
         */
        socket.on('disconnect', () => {
            const { documentId, presence } = socket;

            // Remove user from active room tracking
            if (documentId && activeRooms[documentId]) {
                delete activeRooms[documentId][socket.id];
                
                // Cleanup empty rooms
                if (Object.keys(activeRooms[documentId]).length === 0) {
                    delete activeRooms[documentId];
                } else {
                    // Update remaining users with the new presence list
                    io.to(documentId).emit('active-users-list', Object.values(activeRooms[documentId]));
                }
            }

            // Broadcast the departure so clients can remove the user's cursor
            if (documentId && presence) {
                socket.broadcast.to(documentId).emit('user-left', socket.id);
            }
        });
    });
};

export default socketHandler;
