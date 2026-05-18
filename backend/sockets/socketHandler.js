import Document from '../models/Document.js';

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
            socket.user = user;

            console.log(`[Socket Room] User ${user.name} joined room ${documentId}`);

            // Broadcast to other users in the room that a new user joined
            socket.broadcast.to(documentId).emit('user-joined', user);
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

            if (documentId && user) {
                // Inform other room members of user exit
                socket.broadcast.to(documentId).emit('user-left', user);
            }
        });
    });
};

export default socketHandler;
