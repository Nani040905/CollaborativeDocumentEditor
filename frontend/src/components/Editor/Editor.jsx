import React, { useCallback, useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

// Premium styling layout overrides for Quill standard styles
const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, false] }],
    [{ font: [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['image', 'code-block', 'blockquote'],
    ['clean']
];

/**
 * Custom Rich Text Editor Component utilizing Quill.js.
 * Implements callback-ref DOM attachment to bypass React Strict Mode multi-mount issues,
 * tracks local input keystrokes, and pipes change notifications to parent components.
 */
const Editor = ({ value, onChange, onInit }) => {
    // Tracks active Quill editor instance across renders
    const quillInstanceRef = useRef(null);

    // Using a callback ref is the safest way to target DOM mounting in React
    const wrapperRef = useCallback((wrapper) => {
        if (wrapper == null) return;

        // Reset and clear any existing elements to prevent the duplicate toolbar bug
        wrapper.innerHTML = '';
        const editorContainer = document.createElement('div');
        wrapper.append(editorContainer);

        // Bootstrap Quill with snow theme and custom toolbar
        const q = new Quill(editorContainer, {
            theme: 'snow',
            modules: {
                toolbar: TOOLBAR_OPTIONS
            },
            placeholder: 'Start writing your shared thoughts here...'
        });

        // Store reference globally
        quillInstanceRef.current = q;
        
        // Pass instance back to parent component (Crucial for Websocket hooks)
        if (onInit) {
            onInit(q);
        }
    }, [onInit]);

    // Handle updates when content is modified
    useEffect(() => {
        const q = quillInstanceRef.current;
        if (!q || !onChange) return;

        const handleTextChange = (delta, oldDelta, source) => {
            // Only fire event if typing was originated by this user
            if (source !== 'user') return;
            onChange(q.getContents(), delta);
        };

        q.on('text-change', handleTextChange);

        return () => {
            q.off('text-change', handleTextChange);
        };
    }, [onChange]);

    // Load initial database data into editor once
    useEffect(() => {
        const q = quillInstanceRef.current;
        if (!q || !value) return;

        // Disabling editing temporarily prevents typing during page loading transition
        q.disable();
        q.setContents(value);
        q.enable();
    }, [value]);

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 px-4 md:px-8 py-4">
            <div 
                className="quill-wrapper flex-1 border border-slate-800 bg-slate-900/20 backdrop-blur-md rounded-2xl flex flex-col overflow-hidden max-w-5xl w-full mx-auto"
                ref={wrapperRef}
            />
        </div>
    );
};

export default Editor;
