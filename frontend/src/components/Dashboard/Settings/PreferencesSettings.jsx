import React from 'react';
import { Shield } from 'lucide-react';

const PreferencesSettings = ({ enableAutosave, setEnableAutosave, presenceBubbles, setPresenceBubbles }) => {
    return (
        <div className="border border-slate-800 bg-slate-900/30 rounded-lg p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                <Shield size={14} className="text-purple-500" />
                <span>Document Preferences</span>
            </h3>

            <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={enableAutosave}
                        onChange={() => setEnableAutosave(!enableAutosave)}
                        className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-blue-500 outline-none focus:ring-0"
                    />
                    <div className="text-xs">
                        <p className="font-semibold text-slate-200">Enable Collaborative Autosave</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Saves editing sheet contents automatically to the server on every stroke.</p>
                    </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={presenceBubbles}
                        onChange={() => setPresenceBubbles(!presenceBubbles)}
                        className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-blue-500 outline-none focus:ring-0"
                    />
                    <div className="text-xs">
                        <p className="font-semibold text-slate-200">Show Collaborator Presence Bubbles</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Renders color-coded online badges of users actively inside the workspace.</p>
                    </div>
                </label>
            </div>
        </div>
    );
};

export default PreferencesSettings;
