import React from 'react';
import { useNavigate } from 'react-router';

const ErrorPage = ({ code = 404, message = "Page Not Found" }) => {
    const navigate = useNavigate();

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-slate-950 px-4 text-center">
            <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900/60 p-8 shadow-sm">
                <h1 className="text-6xl font-bold tracking-tight text-slate-200">{code}</h1>
                <p className="mt-4 text-sm text-slate-400 font-medium">{message}</p>
                <div className="mt-6">
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
