import React from 'react';

/**
 * Remote Cursors Overlay Component.
 * Renders the real-time cursor positions and name tags of other collaborators.
 */
const RemoteCursorsOverlay = ({ showPresence, remoteCursors }) => {
    if (!showPresence) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-50 max-w-5xl w-full mx-auto px-4 md:px-8 py-4 mt-[55px]">
            <div className="relative w-full h-full">
                {Object.entries(remoteCursors).map(([socketId, { user: rUser, bounds }]) => (
                    <div 
                        key={socketId}
                        className="absolute transition-all duration-75"
                        style={{
                            top: bounds.top,
                            left: bounds.left + 25, // Align exact typing caret position
                        }}
                    >
                        {/* Vertical Cursor Bar */}
                        <div 
                            className="w-[2px] h-[20px] relative animate-pulse"
                            style={{ backgroundColor: rUser.color }}
                        >
                            {/* Remote Username Tag Banner */}
                            <div 
                                className="absolute bottom-[20px] left-0 px-1.5 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap shadow-md select-none transform translate-y-[-2px]"
                                style={{ backgroundColor: rUser.color }}
                            >
                                {rUser.name}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RemoteCursorsOverlay;
