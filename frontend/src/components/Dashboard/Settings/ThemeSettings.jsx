import React from 'react';
import { Monitor } from 'lucide-react';

const ThemeSettings = ({ settingsTheme, setSettingsTheme }) => {
    return (
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
    );
};

export default ThemeSettings;
