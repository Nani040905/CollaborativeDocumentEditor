import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import axios from 'axios';
import { RefreshCw, UserPlus, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Join Document Link Gateway Component.
 * Automatically adds the authenticated user to the document's collaborators
 * list and then redirects them to the document workspace.
 */
const JoinDocument = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('joining'); // 'joining', 'error'
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const joinWorkspace = async () => {
            try {
                const res = await axios.post(
                    `${API_URL}/documents/${id}/join`,
                    {},
                    { withCredentials: true }
                );
                
                if (res.status === 200) {
                    // Navigate directly to the editor workspace
                    navigate(`/document/${id}`);
                } else {
                    setStatus('error');
                    setErrorMsg('Could not register workspace privileges.');
                }
            } catch (err) {
                setStatus('error');
                setErrorMsg(err.response?.data?.message || 'Failed to join document workspace.');
            }
        };

        joinWorkspace();
    }, [id, navigate]);

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
                <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-6">
                    <div className="mx-auto h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-red-400" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-slate-100 font-display">Workspace Access Error</h3>
                        <p className="text-sm text-slate-400">{errorMsg}</p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition cursor-pointer"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6">
                <div className="mx-auto h-14 w-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center relative">
                    <UserPlus className="h-6 w-6 text-blue-400" />
                    <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 border-t-transparent animate-spin" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-100 font-display">Joining Collaborative Space</h3>
                    <p className="text-sm text-slate-400">Verifying security token and allocating user presence keys...</p>
                </div>
                <div className="flex justify-center items-center gap-2 text-xs font-semibold text-slate-500">
                    <RefreshCw className="h-3 w-3 animate-spin text-blue-450" />
                    <span>Connecting editor to MERN cluster...</span>
                </div>
            </div>
        </div>
    );
};

export default JoinDocument;
