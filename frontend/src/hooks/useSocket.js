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
