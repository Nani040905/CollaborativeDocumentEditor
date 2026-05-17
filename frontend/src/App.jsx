import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import DocumentWorkspace from './components/Editor/DocumentWorkspace';
import ProtectedRoute from './components/Common/ProtectedRoute';
import ErrorPage from './components/Common/ErrorPage';
import useAuthStore from './store/store-placeholder';

function App() {
    const checkAuth = useAuthStore((state) => state.checkAuth);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <Router>
            <Routes>
                {/* Home redirection */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Secured Private Routes */}
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
