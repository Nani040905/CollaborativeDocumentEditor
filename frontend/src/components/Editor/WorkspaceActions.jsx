import React from 'react';
import { Moon, Sun, Save, Share2, Check, Copy } from 'lucide-react';

/**
 * Workspace Actions Component.
 * Contains action buttons for saving, sharing, and toggling themes within the editor.
 */
const WorkspaceActions = ({
    id,
    autosaveEnabled,
    handleManualSave,
    showShare,
    setShowShare,
    inviteLinkCopied,
    handleCopyInviteLink,
    inviteEmail,
    setInviteEmail,
    handleInviteCollaborator,
    inviteMessage,
    inviteSuccess,
    theme,
    toggleTheme
}) => {
    return (
        <div className="flex items-center gap-4">
            {/* Theme Toggle Switch */}
            <button
                onClick={toggleTheme}
                className="flex items-center justify-center p-2 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer select-none"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
                {theme === 'dark' ? <Moon size={13} className="text-blue-400" /> : <Sun size={13} className="text-yellow-500" />}
            </button>

            {!autosaveEnabled && (
                <button
                    onClick={handleManualSave}
                    className="flex items-center gap-1.5 rounded bg-blue-600 hover:bg-blue-750 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 cursor-pointer select-none"
                    title="Save Changes to Cloud"
                >
                    <Save size={13} />
                    <span>Save</span>
                </button>
            )}

            {/* Share Trigger */}
            <div className="relative">
                <button
                    onClick={() => setShowShare(!showShare)}
                    className="flex items-center gap-1.5 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition cursor-pointer"
                >
                    <Share2 size={13} />
                    <span>Share</span>
                </button>

                {showShare && (
                    <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-800 bg-slate-900 p-4 shadow-md z-30 space-y-4">
                        <div>
                            <h4 className="text-xs font-semibold text-slate-200 mb-1">Collaboration Invite Link</h4>
                            <p className="text-[9px] text-slate-500 mb-2">Share this invite link to automatically register collaborators.</p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={`${window.location.origin}/join/${id}`}
                                    className="flex-1 rounded border border-slate-800 bg-slate-955 px-2 py-1 text-[10px] text-slate-400 select-all outline-none"
                                />
                                <button
                                    onClick={handleCopyInviteLink}
                                    className="p-1.5 rounded bg-purple-600 hover:bg-purple-700 text-white transition cursor-pointer"
                                    title="Copy invite link"
                                >
                                    {inviteLinkCopied ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-slate-800 pt-3">
                            <h4 className="text-xs font-semibold text-slate-200 mb-1">Invite Collaborator</h4>
                            <p className="text-[9px] text-slate-500 mb-2">Add a user to this workspace via their registered email.</p>
                            <form onSubmit={handleInviteCollaborator} className="flex gap-2">
                                <input
                                    type="email"
                                    required
                                    placeholder="user@example.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="flex-1 rounded border border-slate-800 bg-slate-955 px-2 py-1 text-xs text-slate-200 outline-none"
                                />
                                <button
                                    type="submit"
                                    className="rounded bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 text-xs font-semibold transition cursor-pointer"
                                >
                                    Invite
                                </button>
                            </form>
                            {inviteMessage && (
                                <p className={`text-[9px] mt-2 font-semibold ${inviteSuccess ? 'text-green-400' : 'text-red-400'}`}>
                                    {inviteMessage}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkspaceActions;
