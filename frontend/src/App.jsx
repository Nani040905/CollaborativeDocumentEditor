import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import DocumentWorkspace from './components/Editor/DocumentWorkspace';
import JoinDocument from './components/Editor/JoinDocument';
import ProtectedRoute from './components/Common/ProtectedRoute';
import ErrorPage from './components/Common/ErrorPage';
import useAuthStore from './store/store-placeholder';
import useThemeStore from './store/useThemeStore';

/**
 * Root Application Router & Bootstrapper Component.
 * Maps out public authentication forms, secures collaborative dashboard and editing workspaces
 * using the `<ProtectedRoute>` gating wrapper, maps HTTP error codes to customized pages,
 * and boots active user sessions and visual theme settings upon initial mount.
 */
function App() {
    // Extract state-bootstrap methods from Zustand stores
    const checkAuth = useAuthStore((state) => state.checkAuth);
    const initTheme = useThemeStore((state) => state.initTheme);

    // Bootstraps active session authentication status and visual theme on mount
    useEffect(() => {
        checkAuth();
        initTheme();
    }, [checkAuth, initTheme]);

    return (
        <Router>
            <Routes>
                {/* Home redirection - Redirects root visitors straight to the dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Secured Private Routes (Protected by session verification gates) */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/document/:id" 
                    element={
                        <ProtectedRoute>
                            <DocumentWorkspace />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/join/:id" 
                    element={
                        <ProtectedRoute>
                            <JoinDocument />
                        </ProtectedRoute>
                    } 
                />
                
                {/* Dedicated Error Routes */}
                <Route path="/403" element={<ErrorPage code={403} message="Forbidden. You do not have permission to view this resource." />} />
                <Route path="/500" element={<ErrorPage code={500} message="Internal Server Error. Something went wrong on our end." />} />
                
                {/* Fallback 404 Route */}
                <Route path="*" element={<ErrorPage code={404} message="The page you are looking for does not exist." />} />
            </Routes>
        </Router>
    );
}

export default App;
