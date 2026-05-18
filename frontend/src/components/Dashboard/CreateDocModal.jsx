import React from 'react';
import { X } from 'lucide-react';

const CreateDocModal = ({
    showModal,
    setShowModal,
    newTitle,
    setNewTitle,
    newTemplate,
    setNewTemplate,
    handleCreateDocument
}) => {
    if (!showModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs px-4">
            <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-md relative">
                <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                    <X size={16} />
                </button>

                <h3 className="text-sm font-bold text-slate-200 font-display mb-4">Create New Document</h3>

                <form onSubmit={handleCreateDocument} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                            Document Title
                        </label>
                        <input
                            type="text"
                            required
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Enter document title..."
                            className="w-full rounded border border-slate-800 bg-slate-955 py-2 px-3 text-xs text-slate-200 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                            Template Style
                        </label>
                        <select
                            value={newTemplate}
                            onChange={(e) => setNewTemplate(e.target.value)}
                            className="w-full rounded border border-slate-800 bg-slate-955 py-2 px-3 text-xs text-slate-350 outline-none focus:border-blue-500"
                        >
                            <option value="blank">Blank Strategy Sheet</option>
                            <option value="code">Software Technical Design</option>
                        </select>
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="rounded border border-slate-800 bg-slate-950 hover:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-400 transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-semibold text-white transition cursor-pointer"
                        >
                            Create Document
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateDocModal;
