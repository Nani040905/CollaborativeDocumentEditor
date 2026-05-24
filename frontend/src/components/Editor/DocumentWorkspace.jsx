import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import useAuthStore from '../../store/useAuthStore';
import useDocStore from '../../store/useDocStore';
import Editor from './Editor';
import useThemeStore from '../../store/useThemeStore';
import { useSocket } from '../../hooks/useSocket';
import { useWorkspaceSocket } from '../../hooks/useWorkspaceSocket';
import { useWorkspaceState } from '../../hooks/useWorkspaceState';

import WorkspaceHeader from './WorkspaceHeader';
import WorkspacePresence from './WorkspacePresence';
import WorkspaceActions from './WorkspaceActions';
import RemoteCursorsOverlay from './RemoteCursorsOverlay';

const DocumentWorkspace = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { 
        currentDocument, 
        fetchDocumentById, 
        updateTitleInDashboard, 
        inviteCollaborator, 
        updateContent,
        loading: docsLoading 
    } = useDocStore();
    const { theme, toggleTheme } = useThemeStore();

    const { socket, connected } = useSocket(id, user);
    const [quill, setQuill] = useState(null);

    const { activeUsers, remoteCursors } = useWorkspaceSocket(socket, quill, connected);
    
    const {
        title,
        saveStatus,
        showShare, setShowShare,
        inviteLinkCopied,
        inviteEmail, setInviteEmail,
        inviteMessage,
        inviteSuccess,
        autosaveEnabled,
        showPresence,
        handleTitleChange, handleEditorChange, handleManualSave,
        handleCopyInviteLink, handleInviteCollaborator
    } = useWorkspaceState(id, currentDocument, fetchDocumentById, updateTitleInDashboard, updateContent, inviteCollaborator, navigate, socket, connected);

    return (
        <div className="workspace-outer-wrapper flex flex-col h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden">
            <header className="h-14 border-b border-slate-800 bg-slate-900/60 px-6 flex items-center justify-between min-h-14">
                <WorkspaceHeader 
                    title={title}
                    handleTitleChange={handleTitleChange}
                    saveStatus={saveStatus}
                    navigate={navigate}
                />

                <div className="flex items-center gap-4">
                    <WorkspacePresence 
                        connected={connected}
                        showPresence={showPresence}
                        activeUsers={activeUsers}
                    />

                    <WorkspaceActions 
                        id={id}
                        autosaveEnabled={autosaveEnabled}
                        handleManualSave={handleManualSave}
                        showShare={showShare}
                        setShowShare={setShowShare}
                        inviteLinkCopied={inviteLinkCopied}
                        handleCopyInviteLink={handleCopyInviteLink}
                        inviteEmail={inviteEmail}
                        setInviteEmail={setInviteEmail}
                        handleInviteCollaborator={handleInviteCollaborator}
                        inviteMessage={inviteMessage}
                        inviteSuccess={inviteSuccess}
                        theme={theme}
                        toggleTheme={toggleTheme}
                    />
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                <main className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
                    {docsLoading ? (
                        <div className="flex justify-center items-center flex-1 text-xs font-semibold text-slate-500">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent mr-2"></div>
                            <span>Connecting editor to MERN cluster...</span>
                        </div>
                    ) : (
                        <Editor 
                            value={currentDocument?.content} 
                            onChange={handleEditorChange}
                            onInit={(instance) => setQuill(instance)}
                        />
                    )}
                </main>

                <RemoteCursorsOverlay 
                    showPresence={showPresence}
                    remoteCursors={remoteCursors}
                />
            </div>
        </div>
    );
};

export default DocumentWorkspace;
