import React from 'react';
import { ArrowLeft, RefreshCw, AlertCircle, Check } from 'lucide-react';

const WorkspaceHeader = ({ title, handleTitleChange, saveStatus, navigate }) => {
    return (
        <div className="flex items-center gap-4 flex-1">
            <button 
                onClick={() => navigate(-1)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition cursor-pointer"
                title="Go back"
            >
                <ArrowLeft size={16} />
            </button>

            <div className="flex items-center gap-3 max-w-lg flex-1">
                <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    className="bg-transparent border-none text-sm font-semibold text-slate-100 outline-none w-full focus:ring-1 focus:ring-slate-800 rounded px-1 py-0.5"
                    placeholder="Untitled Document"
                />
                <div className={`save-status-badge flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] whitespace-nowrap transition-colors ${
                    saveStatus === 'Saving...' ? 'bg-slate-800/80 text-slate-400' :
                    saveStatus === 'Changes pending' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold' :
                    saveStatus === 'Error saving' ? 'bg-red-500/10 border border-red-500/30 text-red-400 font-semibold' :
                    'bg-slate-800/80 text-slate-400'
                }`}>
                    {saveStatus === 'Saving...' ? (
                        <RefreshCw size={10} className="animate-spin text-blue-450" />
                    ) : saveStatus === 'Changes pending' ? (
                        <AlertCircle size={10} className="text-amber-400" />
                    ) : saveStatus === 'Error saving' ? (
                        <AlertCircle size={10} className="text-red-400" />
                    ) : (
                        <Check size={10} className="text-green-500" />
                    )}
                    <span>{saveStatus}</span>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceHeader;
