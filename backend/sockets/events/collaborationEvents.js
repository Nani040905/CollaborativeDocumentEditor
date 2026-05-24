import Document from '../../models/Document.js';

export const registerCollaborationEvents = (socket) => {
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
};
