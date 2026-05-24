export const registerCursorEvents = (socket) => {
    socket.on('cursor-move', (range) => {
        const { documentId, presence } = socket;
        if (!documentId || !presence) return;

        socket.broadcast.to(documentId).emit('remote-cursor-move', {
            socketId: socket.id,
            user: presence,
            range
        });
    });
};
