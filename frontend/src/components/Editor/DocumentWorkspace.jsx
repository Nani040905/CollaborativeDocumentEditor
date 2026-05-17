import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
    ArrowLeft, Check, CloudLightning, RefreshCw, Share2, 
    ChevronRight, AlignLeft, Bold, Italic, List, Code, Copy 
} from 'lucide-react';

const DocumentWorkspace = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [saveStatus, setSaveStatus] = useState('All changes saved');
    const [showShare, setShowShare] = useState(false);
    const [showOutline, setShowOutline] = useState(true);
    const [copied, setCopied] = useState(false);
    const saveTimeoutRef = useRef(null);

    // Fetch document details from localStorage on load
    useEffect(() => {
        const stored = localStorage.getItem('mock_documents');
        if (stored) {
            const list = JSON.parse(stored);
            const found = list.find(doc => doc.id === id);
            if (found) {
                setTitle(found.title);
                setContent(found.content);
            } else {
                // If ID is not found, navigate back to dashboard
                navigate('/dashboard');
            }
        } else {
            navigate('/dashboard');
        }
    }, [id, navigate]);

    // Handle document typing updates with simulation of autosave status
    const handleContentChange = (e) => {
        const newText = e.target.value;
        setContent(newText);
        setSaveStatus('Saving...');

        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Trigger autosave action after 800ms
        saveTimeoutRef.current = setTimeout(() => {
            const stored = localStorage.getItem('mock_documents');
            if (stored) {
                const list = JSON.parse(stored);
                const updated = list.map(doc => {
                    if (doc.id === id) {
                        return { ...doc, content: newText, updatedAt: 'Just now' };
                    }
                    return doc;
                });
                localStorage.setItem('mock_documents', JSON.stringify(updated));
            }
            setSaveStatus('All changes saved');
        }, 800);
    };

    // Handle title updates inline
    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        setSaveStatus('Saving...');

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            const stored = localStorage.getItem('mock_documents');
            if (stored) {
                const list = JSON.parse(stored);
                const updated = list.map(doc => {
                    if (doc.id === id) {
                        return { ...doc, title: newTitle.trim() || 'Untitled Document', updatedAt: 'Just now' };
                    }
                    return doc;
                });
                localStorage.setItem('mock_documents', JSON.stringify(updated));
            }
            setSaveStatus('All changes saved');
        }, 800);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden">
            {/* Header Navigation */}
            <header className="h-14 border-b border-slate-800 bg-slate-900/60 px-6 flex items-center justify-between min-h-14">
                <div className="flex items-center gap-4 flex-1">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition cursor-pointer"
                        title="Back to Dashboard"
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
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 whitespace-nowrap">
                            {saveStatus === 'Saving...' ? (
                                <RefreshCw size={10} className="animate-spin text-blue-400" />
                            ) : (
                                <Check size={10} className="text-green-500" />
                            )}
                            <span>{saveStatus}</span>
                        </div>
                    </div>
                </div>

                {/* Collaboration & Sharing Widget */}
                <div className="flex items-center gap-4">
                    {/* User Presence Circles */}
                    <div className="flex items-center -space-x-1.5">
                        <div className="h-6 w-6 rounded-full border border-slate-900 bg-emerald-700 text-[9px] font-bold text-white flex items-center justify-center cursor-default" title="Jane Doe (Active)">
                            JD
                        </div>
                        <div className="h-6 w-6 rounded-full border border-slate-900 bg-orange-700 text-[9px] font-bold text-white flex items-center justify-center cursor-default" title="Sarah King (Active)">
                            SK
                        </div>
                        <div className="h-6 w-6 rounded-full border border-slate-900 bg-purple-700 text-[9px] font-bold text-white flex items-center justify-center cursor-default" title="Alex Miller (Away)">
                            AM
                        </div>
                    </div>

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
                            <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-800 bg-slate-900 p-4 shadow-md z-30">
                                <h4 className="text-xs font-semibold text-slate-200 mb-2">Share Link</h4>
                                <p className="text-[10px] text-slate-500 mb-3">Copy this workspace URL to collaborate in real-time.</p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={window.location.href}
                                        className="flex-1 rounded border border-slate-800 bg-slate-950 px-2 py-1 text-[10px] text-slate-400 select-all outline-none"
                                    />
                                    <button
                                        onClick={handleCopyLink}
                                        className="p-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
                                        title="Copy link"
                                    >
                                        {copied ? <Check size={14} /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Split Workspace Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Outline Left Sidebar */}
                {showOutline && (
                    <aside className="w-56 border-r border-slate-800 bg-slate-900/40 p-4 space-y-4 overflow-y-auto hidden md:block">
                        <div className="flex items-center gap-1 text-slate-400">
                            <AlignLeft size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Document Outline</span>
                        </div>
                        <ul className="text-xs space-y-2">
                            <li className="flex items-center gap-1 text-slate-300 hover:text-slate-100 cursor-pointer">
                                <ChevronRight size={12} className="text-slate-600" />
                                <span className="font-medium line-clamp-1">1. Summary & Intro</span>
                            </li>
                            <li className="flex items-center gap-1 text-slate-500 hover:text-slate-300 cursor-pointer pl-2">
                                <ChevronRight size={12} className="text-slate-700" />
                                <span className="line-clamp-1">Scope & Parameters</span>
                            </li>
                            <li className="flex items-center gap-1 text-slate-300 hover:text-slate-100 cursor-pointer">
                                <ChevronRight size={12} className="text-slate-600" />
                                <span className="font-medium line-clamp-1">2. Architecture Blueprint</span>
                            </li>
                            <li className="flex items-center gap-1 text-slate-300 hover:text-slate-100 cursor-pointer">
                                <ChevronRight size={12} className="text-slate-600" />
                                <span className="font-medium line-clamp-1">3. Action Items</span>
                            </li>
                        </ul>
                    </aside>
                )}

                {/* Plain Rich Editor Panel */}
                <main className="flex-1 flex flex-col bg-slate-950">
                    {/* Plain Text formatting controls */}
                    <div className="h-10 border-b border-slate-850 px-6 flex items-center gap-1 bg-slate-950/20 text-slate-400">
                        <button 
                            onClick={() => setShowOutline(!showOutline)}
                            className={`p-1 hover:bg-slate-800 rounded transition cursor-pointer ${showOutline ? 'text-blue-400 bg-slate-900/60' : ''}`}
                            title="Toggle Outline Panel"
                        >
                            <AlignLeft size={14} />
                        </button>
                        <div className="h-4 w-px bg-slate-800 mx-2"></div>
                        <button className="p-1 hover:bg-slate-800 rounded transition text-slate-500 cursor-default" title="Bold">
                            <Bold size={14} />
                        </button>
                        <button className="p-1 hover:bg-slate-800 rounded transition text-slate-500 cursor-default" title="Italic">
                            <Italic size={14} />
                        </button>
                        <button className="p-1 hover:bg-slate-800 rounded transition text-slate-500 cursor-default" title="Bullet List">
                            <List size={14} />
                        </button>
                        <button className="p-1 hover:bg-slate-800 rounded transition text-slate-500 cursor-default" title="Code Block">
                            <Code size={14} />
                        </button>
                    </div>

                    {/* Clean Textarea Editing Canvas */}
                    <div className="flex-1 p-8 max-w-3xl w-full mx-auto overflow-y-auto">
                        <textarea
                            value={content}
                            onChange={handleContentChange}
                            className="w-full h-full bg-transparent border-none outline-none resize-none text-slate-200 text-sm leading-relaxed placeholder-slate-700 font-sans"
                            placeholder="Write your distraction-free document contents here..."
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DocumentWorkspace;
