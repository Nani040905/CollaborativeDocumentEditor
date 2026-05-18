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
