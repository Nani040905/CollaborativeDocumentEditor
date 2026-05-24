import React from 'react';
import { Save, CheckCircle } from 'lucide-react';
import ProfileSettings from './Settings/ProfileSettings';
import ThemeSettings from './Settings/ThemeSettings';
import PreferencesSettings from './Settings/PreferencesSettings';

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
                <ProfileSettings 
                    settingsName={settingsName} 
                    setSettingsName={setSettingsName} 
                    userEmail={user?.email} 
                />

                <ThemeSettings 
                    settingsTheme={settingsTheme} 
                    setSettingsTheme={setSettingsTheme} 
                />

                <PreferencesSettings 
                    enableAutosave={enableAutosave}
                    setEnableAutosave={setEnableAutosave}
                    presenceBubbles={presenceBubbles}
                    setPresenceBubbles={setPresenceBubbles}
                />

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
