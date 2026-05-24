import { authorizeSocket } from './middleware.js';
import { registerRoomEvents } from './events/roomEvents.js';
import { registerCollaborationEvents } from './events/collaborationEvents.js';
import { registerCursorEvents } from './events/cursorEvents.js';

const socketHandler = (io) => {
    io.use(authorizeSocket);

    io.on('connection', (socket) => {
        console.log(`[Socket Secure Connected] user: ${socket.userProfile.name} | Socket ID: ${socket.id}`);

        registerRoomEvents(io, socket);
        registerCollaborationEvents(socket);
        registerCursorEvents(socket);
    });
};

export default socketHandler;
