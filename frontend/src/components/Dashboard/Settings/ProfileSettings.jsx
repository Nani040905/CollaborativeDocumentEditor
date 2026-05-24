import React from 'react';
import { Users } from 'lucide-react';

const ProfileSettings = ({ settingsName, setSettingsName, userEmail }) => {
    return (
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
                        value={userEmail || 'mern@example.com'}
                        className="w-full rounded border border-slate-855 bg-slate-955/40 py-2 px-3 text-xs text-slate-650 cursor-not-allowed outline-none"
                    />
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
