import React, { useCallback, useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

// Bind highlight.js globally for Quill's syntax system to coordinate rendering
window.hljs = hljs;

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

    // Keep a stable ref of onInit to avoid recreating callback ref and triggering infinite loops
    const onInitRef = useRef(onInit);
    useEffect(() => {
        onInitRef.current = onInit;
    }, [onInit]);

    // Using a callback ref is the safest way to target DOM mounting in React
    const wrapperRef = useCallback((wrapper) => {
        if (wrapper == null) return;
        if (quillInstanceRef.current) return; // Prevent duplicate bootstrapping in React StrictMode

        // Reset and clear any existing elements to prevent the duplicate toolbar bug
        wrapper.innerHTML = '';
        const editorContainer = document.createElement('div');
        wrapper.append(editorContainer);

        // Bootstrap Quill with snow theme and custom toolbar
        const q = new Quill(editorContainer, {
            theme: 'snow',
            modules: {
                syntax: {
                    hljs: hljs
                },
                toolbar: TOOLBAR_OPTIONS
            },
            placeholder: '    Start writing your shared thoughts here...'
        });

        // Add native title tooltips to all Quill toolbar items for descriptive hover text names
        const toolbar = wrapper.querySelector('.ql-toolbar');
        if (toolbar) {
            const addTitle = (selector, titleText) => {
                const elements = toolbar.querySelectorAll(selector);
                elements.forEach(el => {
                    el.setAttribute('title', titleText);
                });
            };

            // Individual button controls
            addTitle('.ql-bold', 'Bold');
            addTitle('.ql-italic', 'Italic');
            addTitle('.ql-underline', 'Underline');
            addTitle('.ql-strike', 'Strikethrough');
            addTitle('.ql-script[value="sub"]', 'Subscript');
            addTitle('.ql-script[value="super"]', 'Superscript');
            addTitle('.ql-list[value="ordered"]', 'Ordered List');
            addTitle('.ql-list[value="bullet"]', 'Bullet List');
            addTitle('.ql-image', 'Insert Image');
            addTitle('.ql-code-block', 'Code Block');
            addTitle('.ql-blockquote', 'Blockquote');
            addTitle('.ql-clean', 'Clear Formatting');

            // Dropdown select pickers
            addTitle('.ql-font', 'Font Family');
            addTitle('.ql-header', 'Heading Style');
            addTitle('.ql-color', 'Text Color');
            addTitle('.ql-background', 'Background Color');
            addTitle('.ql-align', 'Text Alignment');
        }

        // Store reference globally
        quillInstanceRef.current = q;
        
        // Pass instance back to parent component (Crucial for Websocket hooks)
        if (onInitRef.current) {
            onInitRef.current(q);
        }
    }, []); // Empty dependency array ensures this is created exactly once!

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
        <div className="editor-container-wrapper flex-1 flex flex-col h-full overflow-hidden bg-slate-950 px-4 md:px-8 py-4">
            <div 
                className="quill-wrapper flex-1 border border-slate-800 bg-slate-900/20 backdrop-blur-md rounded-2xl flex flex-col overflow-hidden max-w-5xl w-full mx-auto"
                ref={wrapperRef}
            />
        </div>
    );
};

export default Editor;
