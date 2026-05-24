# Part 8: WebSocket Setup (Socket.IO)

In this guide, you will transition your application from static REST calls into a dynamic, two-way WebSocket hub. You will build a highly modular Socket Handler on the backend, compile a custom React hook on the client side for persistent socket lifecycle tracking, and handle connection reconnect logic.

---

## 1. Modular Backend Socket Architecture

Rather than clustering our socket logic inside `server.js`, we route all real-time events into a dedicated `socketHandler.js` controller module.

### Implementing Socket Engine Hub (`sockets/socketHandler.js`)
Create the file `backend/sockets/socketHandler.js` and paste this code:

```javascript
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
```

### Hooking Sockets to Main Server
Modify your `backend/server.js` file to import and mount this handler. Update your socket section like this:

```javascript
// Import the new socket handler
import socketHandler from './sockets/socketHandler.js';

// ... (Rest of Express Server settings)

// Bind Sockets
socketHandler(io);
```

---

## 2. Robust React Socket Hook (`hooks/useSocket.js`)

To consume WebSockets in React safely, we should encapsulate our `socket.io-client` connection inside a custom hook that manages socket connections and automatically cleans up handlers on component unmounts.

### Creating Socket Connector Hook (`hooks/useSocket.js`)
Create the file `frontend/src/hooks/useSocket.js` and add this code:

```javascript
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = (documentId, user) => {
    const [connected, setConnected] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!documentId || !user) return;

        // Establish bidirectional WebSocket pipeline
        const socket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling'], // Fallback to polling if WebSockets fail
            autoConnect: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 3000
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setConnected(true);
            console.log('[Socket] Connected to server successfully.');

            // Handshake: Instantly join our assigned document workspace room
            socket.emit('join-document', { documentId, user });
        });

        socket.on('disconnect', () => {
            setConnected(false);
            console.log('[Socket] Disconnected from server.');
        });

        socket.on('connect_error', (error) => {
            console.error('[Socket Error] Connection attempt failed:', error.message);
        });

        // Cleanup: Tear down socket cleanly when component unmounts
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [documentId, user]);

    return {
        socket: socketRef.current,
        connected
    };
};
```

---

## 3. How Socket Rooms Work

Instead of broadcasting editor operations globally to all active visitors (which would corrupt other files), Socket.io **Rooms** allow us to partition the connection namespace:
* `socket.join(docId)` creates an isolated channel where only users editing that specific document listen.
* `socket.broadcast.to(docId).emit(...)` ensures text inputs are only sent to other users inside that exact room, keeping data transmission safe, fast, and organized.

Next, we will wire up the synchronization pipeline to transmit text inputs between editors.
