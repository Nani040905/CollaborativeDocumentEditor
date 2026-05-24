import Document from '../../models/Document.js';
import { activeRooms, CURSOR_COLORS } from '../store.js';

export const registerRoomEvents = (io, socket) => {
    const user = socket.userProfile;

    socket.on('join-document', async ({ documentId }) => {
        if (!documentId) return;

        try {
            const doc = await Document.findById(documentId);
            if (!doc) {
                return socket.emit('error', 'Document not found.');
            }

            const isOwner = doc.owner.toString() === user.id;
            const isCollaborator = doc.collaborators.some((c) => c.toString() === user.id);

            if (!isOwner && !isCollaborator) {
                console.warn(`[Security Intrusion Alert] User ${user.name} attempted unauthorized access to doc ${documentId}`);
                return socket.emit('unauthorized', 'Access denied. You are not authorized to view this document.');
            }

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
};
