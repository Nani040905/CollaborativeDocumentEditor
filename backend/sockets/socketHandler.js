import Document from '../models/Document.js';

// Memory store to track active users per document room
// Schema: { [documentId]: { [socketId]: { id, name, email, color } } }
const activeRooms = {};

// Palette for generating random user cursor colors
const CURSOR_COLORS = [
    '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', 
    '#ec4899', '#f43f5e', '#14b8a6', '#06b6d4'
];

/**
 * Modular Socket.IO Handler.
 * Sets up isolated document rooms, real-time rich-text delta broadcasters,
 * and high-frequency debounced database autosave persistence brokers.
 */
const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log(`[Socket Connected] Socket ID: ${socket.id}`);

        // Listen for document room join requests
        socket.on('join-document', ({ documentId, user }) => {
            if (!documentId || !user) return;

            // Put this socket inside an isolated room named by the Document ID
            socket.join(documentId);
            
            // Tag connection metadata properties
            socket.documentId = documentId;

            // Assign a random color for cursor overlays
            const userColor = CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
            const userProfile = { ...user, color: userColor };
            socket.user = userProfile;

            console.log(`[Socket Room] User ${user.name} joined room ${documentId} with cursor color ${userColor}`);

            // Initialize room container if empty
            if (!activeRooms[documentId]) {
                activeRooms[documentId] = {};
            }
            // Save user to active list
            activeRooms[documentId][socket.id] = userProfile;

            // Send list of all active users in the room back to the client that just joined
            socket.emit('active-users-list', Object.values(activeRooms[documentId]));

            // Broadcast to everyone else in the room that a new collaborator has joined
            socket.broadcast.to(documentId).emit('user-joined', userProfile);
        });

        // Broadcast cursor selection movements
        socket.on('cursor-move', (range) => {
            const { documentId, user } = socket;
            if (!documentId || !user) return;

            // Broadcast remote user's cursor selection to other clients
            socket.broadcast.to(documentId).emit('remote-cursor-move', {
                socketId: socket.id,
                user,
                range
            });
        });

        // Listen for editor rich-text delta synchronization packets
        socket.on('send-changes', (delta) => {
            const { documentId } = socket;
            if (!documentId) return;

            // Broadcast the operational delta back out to other room occupants (avoiding echoing back to the typing client)
            socket.broadcast.to(documentId).emit('receive-changes', delta);
        });

        // SAVE DOCUMENT PERSISTENCE HANDLER
        // Persists the debounced rich-text JSON content state from the client directly to MongoDB.
        socket.on('save-document', async (content) => {
            const { documentId } = socket;
            if (!documentId) return;

            try {
                // Perform high-efficiency database write bypassing heavy HTTP pipelines
                await Document.findByIdAndUpdate(documentId, { content });
                console.log(`[Autosave] Document ${documentId} persisted successfully over WebSocket.`);
            } catch (error) {
                console.error(`[Autosave Error] Failed to save document ${documentId}:`, error.message);
            }
        });

        // Handle connection drop-offs
        socket.on('disconnect', () => {
            console.log(`[Socket Disconnected] Socket ID: ${socket.id}`);
            const { documentId, user } = socket;

            if (documentId && activeRooms[documentId]) {
                // Remove user from active dictionary
                delete activeRooms[documentId][socket.id];
                
                // Clear empty room containers
                if (Object.keys(activeRooms[documentId]).length === 0) {
                    delete activeRooms[documentId];
                } else {
                    // Update other room users
                    io.to(documentId).emit('active-users-list', Object.values(activeRooms[documentId]));
                }
            }

            if (documentId && user) {
                // Inform other room members of user exit using the specific socket ID
                socket.broadcast.to(documentId).emit('user-left', socket.id);
            }
        });
    });
};

export default socketHandler;
