import React from 'react';
import { Users, Monitor, Shield, Save, CheckCircle } from 'lucide-react';

/**
 * Settings Panel Component.
 * Provides forms and toggles for updating user profile, theme, and editor preferences.
 */
const SettingsPanel = ({
    settingsName,
    setSettingsName,
    user,
    settingsTheme,
    setSettingsTheme,
    enableAutosave,
    setEnableAutosave,
    presenceBubbles,
    setPresenceBubbles,
    handleSaveSettings,
    settingsSaved
}) => {
    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <h1 className="text-xl font-bold tracking-tight text-slate-100 font-display">System Settings</h1>
                <p className="text-xs text-slate-500 mt-1">Manage your account preferences, theme interfaces, and document controls</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-8">
                {/* Profile Preferences */}
                <div className="border border-slate-800 bg-slate-900/30 rounded-lg p-6 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                        <Users size={14} className="text-blue-500" />
                        <span>Account Profile</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={settingsName}
                                onChange={(e) => setSettingsName(e.target.value)}
                                className="w-full rounded border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-slate-250 outline-none focus:border-slate-700"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                disabled
                                value={user?.email || 'mern@example.com'}
                                className="w-full rounded border border-slate-855 bg-slate-955/40 py-2 px-3 text-xs text-slate-650 cursor-not-allowed outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Visual Interfaces */}
                <div className="border border-slate-800 bg-slate-900/30 rounded-lg p-6 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                        <Monitor size={14} className="text-emerald-500" />
                        <span>Visual Interface Theme</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className={`border rounded-lg p-4 flex flex-col justify-between h-24 cursor-pointer transition select-none ${
                            settingsTheme === 'deep-obsidian' 
                                ? 'border-blue-500 bg-slate-900/80 text-slate-100' 
                                : 'border-slate-800 bg-slate-955/20 text-slate-400 hover:border-slate-700'
                        }`}>
                            <input 
                                type="radio" 
                                name="theme" 
                                value="deep-obsidian"
                                checked={settingsTheme === 'deep-obsidian'}
                                onChange={() => setSettingsTheme('deep-obsidian')}
                                className="sr-only" 
                            />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Deep Obsidian</span>
                            <span className="text-[9px] text-slate-500">Dark blue and deep slate palette.</span>
                        </label>

                        <label className={`border rounded-lg p-4 flex flex-col justify-between h-24 cursor-pointer transition select-none ${
                            settingsTheme === 'classic-dark' 
                                ? 'border-blue-500 bg-slate-900/80 text-slate-100' 
                                : 'border-slate-800 bg-slate-955/20 text-slate-400 hover:border-slate-700'
                        }`}>
                            <input 
                                type="radio" 
                                name="theme" 
                                value="classic-dark"
                                checked={settingsTheme === 'classic-dark'}
                                onChange={() => setSettingsTheme('classic-dark')}
                                className="sr-only" 
                            />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Classic Dark</span>
                            <span className="text-[9px] text-slate-500">Neutral dark and charcoal background.</span>
                        </label>

                        <label className={`border rounded-lg p-4 flex flex-col justify-between h-24 cursor-pointer transition select-none ${
                            settingsTheme === 'monochrome' 
                                ? 'border-blue-500 bg-slate-900/80 text-slate-100' 
                                : 'border-slate-800 bg-slate-955/20 text-slate-400 hover:border-slate-700'
                        }`}>
                            <input 
                                type="radio" 
                                name="theme" 
                                value="monochrome"
                                checked={settingsTheme === 'monochrome'}
                                onChange={() => setSettingsTheme('monochrome')}
                                className="sr-only" 
                            />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Monochrome Slate</span>
                            <span className="text-[9px] text-slate-500">Pure minimal greyscale values.</span>
                        </label>
                    </div>
                </div>

                {/* Security Toggles */}
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

                {/* Save Button */}
                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="submit"
                        className="flex items-center gap-1.5 rounded bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-750 cursor-pointer shadow-sm"
                    >
                        <Save size={14} />
                        <span>Save System Preferences</span>
                    </button>

                    {settingsSaved && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-green-400">
                            <CheckCircle size={14} />
                            <span>Preferences updated successfully!</span>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default SettingsPanel;
