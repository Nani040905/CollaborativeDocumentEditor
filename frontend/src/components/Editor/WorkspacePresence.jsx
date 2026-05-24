import React from 'react';
import { CloudLightning, RefreshCw } from 'lucide-react';

/**
 * Workspace Presence Component.
 * Displays the current WebSocket connection status and active user avatars.
 */
const WorkspacePresence = ({ connected, showPresence, activeUsers }) => {
    return (
        <div className="flex items-center gap-4">
            {/* Live Sync Connection Status */}
            {connected ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold select-none">
                    <CloudLightning size={12} className="animate-pulse text-emerald-450" />
                    <span>Live Sync</span>
                </div>
            ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold animate-pulse select-none">
                    <RefreshCw size={12} className="animate-spin text-amber-455" />
                    <span>Reconnecting...</span>
                </div>
            )}

            {/* User Presence Circles */}
            {showPresence && (
                <div className="flex items-center -space-x-1.5 overflow-hidden animate-fade-in" title="Collaborators active in workspace">
                    {activeUsers.slice(0, 4).map((userProfile, idx) => (
                        <div 
                            key={idx} 
                            className="collaborator-avatar h-6 w-6 rounded-full border border-slate-900 flex items-center justify-center text-[9px] font-bold text-white shadow-md select-none"
                            style={{ backgroundColor: userProfile.color || '#3b82f6' }}
                            title={`${userProfile.name} (${userProfile.email})`}
                        >
                            {userProfile.name.charAt(0).toUpperCase()}
                        </div>
                    ))}
                    {activeUsers.length > 4 && (
                        <div className="h-6 w-6 rounded-full bg-slate-800 border border-slate-900 flex items-center justify-center text-[9px] font-semibold text-slate-300">
                            +{activeUsers.length - 4}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WorkspacePresence;
