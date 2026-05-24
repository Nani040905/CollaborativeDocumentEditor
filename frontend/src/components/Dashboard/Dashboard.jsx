import React from 'react';
import { useNavigate } from 'react-router';
import useAuthStore from '../../store/useAuthStore';
import useDocStore from '../../store/useDocStore';
import useThemeStore from '../../store/useThemeStore';
import { useDashboardState } from '../../hooks/useDashboardState';

import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import DocumentGrid from './DocumentGrid';
import TrashGrid from './TrashGrid';
import SettingsPanel from './SettingsPanel';
import CreateDocModal from './CreateDocModal';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout, updateProfile } = useAuthStore();
    const { 
        documents: dbDocuments, 
        fetchDocuments, 
        createDocument: dbCreateDocument, 
        deleteDocument: dbDeleteDocument,
        loading: docsLoading 
    } = useDocStore();
    const { theme, toggleTheme } = useThemeStore();

    const {
        activeTab, setActiveTab,
        searchQuery, setSearchQuery,
        trashDocuments,
        showModal, setShowModal,
        newTitle, setNewTitle,
        newTemplate, setNewTemplate,
        settingsSaved,
        settingsName, setSettingsName,
        settingsTheme, setSettingsTheme,
        enableAutosave, setEnableAutosave,
        presenceBubbles, setPresenceBubbles,
        getOwnerInitials, getOwnerName, formatTimestamp, formatSnippet,
        handleCreateDocument, handleMoveToTrash, handleRestoreFromTrash, handlePermanentDelete,
        handleEmptyTrash, handleSaveSettings, handleLogout,
        activeList
    } = useDashboardState(user, fetchDocuments, dbDocuments, dbCreateDocument, dbDeleteDocument, updateProfile, logout, navigate);

    return (
        <div className="flex h-screen w-screen bg-slate-950 text-slate-200">
            <DashboardSidebar 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
                handleLogout={handleLogout}
            />

            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {activeTab !== 'settings' && (
                    <DashboardHeader 
                        activeTab={activeTab}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        theme={theme}
                        toggleTheme={toggleTheme}
                        setShowModal={setShowModal}
                        trashCount={trashDocuments.length}
                        handleEmptyTrash={handleEmptyTrash}
                    />
                )}

                <div className="flex-1 overflow-y-auto p-8">
                    {docsLoading && activeTab !== 'settings' && activeTab !== 'trash' && (
                        <div className="flex justify-center items-center h-48 text-xs font-semibold text-slate-500">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent mr-2"></div>
                            <span>Retrieving records from database...</span>
                        </div>
                    )}

                    {activeTab === 'documents' && !docsLoading && (
                        <>
                            <div className="mb-6">
                                <h1 className="text-xl font-bold tracking-tight text-slate-100 font-display">Documents</h1>
                                <p className="text-xs text-slate-500 mt-1">Access your clean MERN collaborative notebooks</p>
                            </div>
                            <DocumentGrid 
                                documents={activeList}
                                isShared={false}
                                formatSnippet={formatSnippet}
                                formatTimestamp={formatTimestamp}
                                getOwnerInitials={getOwnerInitials}
                                getOwnerName={getOwnerName}
                                handleMoveToTrash={handleMoveToTrash}
                                navigate={navigate}
                            />
                        </>
                    )}

                    {activeTab === 'shared' && !docsLoading && (
                        <>
                            <div className="mb-6">
                                <h1 className="text-xl font-bold tracking-tight text-slate-100 font-display">Shared with Me</h1>
                                <p className="text-xs text-slate-500 mt-1">Sheets shared with you by other active team members</p>
                            </div>
                            <DocumentGrid 
                                documents={activeList}
                                isShared={true}
                                formatSnippet={formatSnippet}
                                formatTimestamp={formatTimestamp}
                                getOwnerInitials={getOwnerInitials}
                                getOwnerName={getOwnerName}
                                handleMoveToTrash={handleMoveToTrash}
                                navigate={navigate}
                            />
                        </>
                    )}

                    {activeTab === 'trash' && (
                        <>
                            <div className="mb-6">
                                <h1 className="text-xl font-bold tracking-tight text-slate-100 font-display">Trash Bin</h1>
                                <p className="text-xs text-slate-500 mt-1">Review, restore, or permanently delete items from your workspace</p>
                            </div>
                            <TrashGrid 
                                trashDocuments={activeList}
                                formatSnippet={formatSnippet}
                                formatTimestamp={formatTimestamp}
                                handleRestoreFromTrash={handleRestoreFromTrash}
                                handlePermanentDelete={handlePermanentDelete}
                            />
                        </>
                    )}

                    {activeTab === 'settings' && (
                        <SettingsPanel 
                            settingsName={settingsName}
                            setSettingsName={setSettingsName}
                            user={user}
                            settingsTheme={settingsTheme}
                            setSettingsTheme={setSettingsTheme}
                            enableAutosave={enableAutosave}
                            setEnableAutosave={setEnableAutosave}
                            presenceBubbles={presenceBubbles}
                            setPresenceBubbles={setPresenceBubbles}
                            handleSaveSettings={handleSaveSettings}
                            settingsSaved={settingsSaved}
                        />
                    )}
                </div>
            </main>

            <CreateDocModal 
                showModal={showModal}
                setShowModal={setShowModal}
                newTitle={newTitle}
                setNewTitle={setNewTitle}
                newTemplate={newTemplate}
                setNewTemplate={setNewTemplate}
                handleCreateDocument={handleCreateDocument}
            />
        </div>
    );
};

export default Dashboard;
