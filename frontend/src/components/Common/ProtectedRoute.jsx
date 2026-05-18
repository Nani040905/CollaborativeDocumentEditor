import React from 'react';
import { Navigate } from 'react-router';
import useAuthStore from '../../store/useAuthStore';

/**
 * Route Gating Component.
 * Restricts access to children components (e.g. Dashboard, Editor Workspace) based on
 * active session validation. Displays a loading indicator while session verify API calls run,
 * and redirects unauthenticated users back to the Login screen.
 */
const ProtectedRoute = ({ children }) => {
    // Extract authenticated flags and loading states from auth store
    const { isAuthenticated, loading } = useAuthStore();

    // Render verification placeholder while API handshake completes
    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-400">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></div>
                    <span className="text-sm font-medium tracking-wide">Verifying session...</span>
                </div>
            </div>
        );
    }

    // Force redirection to login if session verification fails
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Render children if session checks pass successfully
    return children;
};

export default ProtectedRoute;
