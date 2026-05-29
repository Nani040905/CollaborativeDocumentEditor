import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Shared Error Boundary Fallback UI Component.
 * Dynamically displays standard HTTP errors (e.g. 403 Forbidden, 404 Missing, 500 Failure)
 * with descriptive support messages and provides redirect triggers back to dashboard.
 * 
 * @component
 * @param {Object} props - React props
 * @param {number} props.code - Standard HTTP error code (defaults to 404)
 * @param {string} props.message - Human readable description of the error
 */
const ErrorPage = ({ code = 404, message = "Page Not Found" }) => {
    // Navigator for quickly returning the user to safety (the Dashboard)
    const navigate = useNavigate();

    return (
        // Main full-screen wrapper
        <div className="flex h-screen w-screen items-center justify-center bg-slate-950 px-4 text-center">
            
            {/* Error Message Card */}
            <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900/60 p-8 shadow-sm">
                
                {/* Dynamically displays the target HTTP code status */}
                <h1 className="text-6xl font-bold tracking-tight text-slate-200">{code}</h1>
                
                {/* Fallback descriptive message */}
                <p className="mt-4 text-sm text-slate-400 font-medium">{message}</p>
                
                <div className="mt-6">
                    {/* Navigation redirect shortcut to Dashboard */}
                    {/* Essential for UX to prevent dead-end pages */}
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full rounded bg-blue-600 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 cursor-pointer"
                    >
                        Go back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;
