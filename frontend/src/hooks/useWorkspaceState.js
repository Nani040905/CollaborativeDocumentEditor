import { useState, useEffect, useRef } from 'react';

export const useWorkspaceState = (id, currentDocument, fetchDocumentById, updateTitleInDashboard, updateContent, inviteCollaborator, navigate, socket, connected) => {
    const [title, setTitle] = useState('');
    const [saveStatus, setSaveStatus] = useState('All changes saved');
    const [showShare, setShowShare] = useState(false);
    const [copied, setCopied] = useState(false);
    const [inviteLinkCopied, setInviteLinkCopied] = useState(false);

    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');
    const [inviteSuccess, setInviteSuccess] = useState(false);

    const [autosaveEnabled, setAutosaveEnabled] = useState(true);
    const [showPresence, setShowPresence] = useState(true);
    
    const saveTimeoutRef = useRef(null);
    const editorContentRef = useRef('');

    useEffect(() => {
        const savedAutosave = localStorage.getItem('settings_autosave');
        if (savedAutosave !== null) setAutosaveEnabled(JSON.parse(savedAutosave));
        
        const savedPresence = localStorage.getItem('settings_presence');
        if (savedPresence !== null) setShowPresence(JSON.parse(savedPresence));
    }, []);

    useEffect(() => {
        fetchDocumentById(id)
            .then((doc) => {
                if (doc) {
                    setTitle(doc.title);
                    editorContentRef.current = doc.content || '';
                }
            })
            .catch(() => navigate('/dashboard'));
    }, [id, fetchDocumentById, navigate]);

    useEffect(() => {
        if (currentDocument) setTitle(currentDocument.title);
    }, [currentDocument]);

    const handleTitleChange = async (e) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (currentDocument) {
            await updateTitleInDashboard(id, newTitle);
        }
    };

    const handleEditorChange = (content, delta) => {
        editorContentRef.current = content;

        if (socket && delta) socket.emit('send-changes', delta);

        if (!autosaveEnabled) {
            setSaveStatus('Changes pending');
            return;
        }

        setSaveStatus('Saving...');
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                if (socket && connected) {
                    socket.emit('save-document', content);
                    setSaveStatus('All changes saved');
                } else {
                    await updateContent(id, content);
                    setSaveStatus('All changes saved');
                }
            } catch (err) {
                setSaveStatus('Error saving');
            }
        }, 1500);
    };

    const handleManualSave = async () => {
        setSaveStatus('Saving...');
        try {
            if (socket && connected) {
                socket.emit('save-document', editorContentRef.current);
                setSaveStatus('All changes saved');
            } else {
                await updateContent(id, editorContentRef.current);
                setSaveStatus('All changes saved');
            }
        } catch (err) {
            setSaveStatus('Error saving');
        }
    };

    const handleCopyInviteLink = () => {
        const inviteLink = `${window.location.origin}/join/${id}`;
        navigator.clipboard.writeText(inviteLink);
        setInviteLinkCopied(true);
        setTimeout(() => setInviteLinkCopied(false), 2000);
    };

    const handleInviteCollaborator = async (e) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;

        setInviteMessage('Sending invitation...');
        const res = await inviteCollaborator(id, inviteEmail.trim().toLowerCase());
        
        if (res.success) {
            setInviteSuccess(true);
            setInviteMessage(res.message || 'Collaborator added successfully!');
            setInviteEmail('');
            fetchDocumentById(id);
        } else {
            setInviteSuccess(false);
            setInviteMessage(res.error || 'Failed to add collaborator.');
        }

        setTimeout(() => setInviteMessage(''), 4000);
    };

    return {
        title, setTitle,
        saveStatus, setSaveStatus,
        showShare, setShowShare,
        copied, setCopied,
        inviteLinkCopied, setInviteLinkCopied,
        inviteEmail, setInviteEmail,
        inviteMessage, setInviteMessage,
        inviteSuccess, setInviteSuccess,
        autosaveEnabled, setAutosaveEnabled,
        showPresence, setShowPresence,
        handleTitleChange, handleEditorChange, handleManualSave,
        handleCopyInviteLink, handleInviteCollaborator
    };
};
