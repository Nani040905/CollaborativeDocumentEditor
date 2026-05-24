import { useState, useEffect } from 'react';

export const useWorkspaceSocket = (socket, quill, connected) => {
    const [activeUsers, setActiveUsers] = useState([]);
    const [remoteCursors, setRemoteCursors] = useState({});

    useEffect(() => {
        if (!socket || !quill) return;

        const handleReceiveChanges = (delta) => {
            quill.updateContents(delta);
        };

        const handleActiveUsers = (users) => {
            setActiveUsers(users);
        };

        const handleUserJoined = (newUser) => {
            setActiveUsers((prev) => {
                if (prev.some((u) => u.id === newUser.id)) return prev;
                return [...prev, newUser];
            });
        };

        const handleRemoteCursor = ({ socketId, user: remoteUser, range }) => {
            if (!range) {
                setRemoteCursors((prev) => {
                    const next = { ...prev };
                    delete next[socketId];
                    return next;
                });
                return;
            }

            try {
                const bounds = quill.getBounds(range.index);
                if (bounds) {
                    setRemoteCursors((prev) => ({
                        ...prev,
                        [socketId]: { user: remoteUser, bounds }
                    }));
                }
            } catch (err) {
                // Catch index errors
            }
        };

        const handleUserLeft = (socketId) => {
            setActiveUsers((prev) => prev.filter((u) => u.id !== socketId));
            setRemoteCursors((prev) => {
                const next = { ...prev };
                delete next[socketId];
                return next;
            });
        };

        socket.on('receive-changes', handleReceiveChanges);
        socket.on('active-users-list', handleActiveUsers);
        socket.on('user-joined', handleUserJoined);
        socket.on('remote-cursor-move', handleRemoteCursor);
        socket.on('user-left', handleUserLeft);

        return () => {
            socket.off('receive-changes', handleReceiveChanges);
            socket.off('active-users-list', handleActiveUsers);
            socket.off('user-joined', handleUserJoined);
            socket.off('remote-cursor-move', handleRemoteCursor);
            socket.off('user-left', handleUserLeft);
        };
    }, [socket, quill]);

    useEffect(() => {
        if (!socket || !quill) return;

        const selectionHandler = (range, oldRange, source) => {
            if (source !== 'user') return;
            socket.emit('cursor-move', range);
        };

        quill.on('selection-change', selectionHandler);

        return () => {
            quill.off('selection-change', selectionHandler);
        };
    }, [socket, quill]);

    return { activeUsers, remoteCursors };
};
