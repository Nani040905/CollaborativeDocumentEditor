import React from 'react';
import { FileText, RotateCcw, X, Calendar, Trash2 } from 'lucide-react';

const TrashGrid = ({ 
    trashDocuments, 
    formatSnippet, 
    formatTimestamp, 
    handleRestoreFromTrash, 
    handlePermanentDelete 
}) => {
    if (trashDocuments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-lg p-16 text-center">
                <Trash2 size={40} className="text-slate-600 mb-3" />
                <h3 className="text-sm font-semibold text-slate-300">Trash bin is empty</h3>
                <p className="text-xs text-slate-500 mt-1">Documents you delete will show up here.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trashDocuments.map((doc) => (
                <div
                    key={doc.id}
                    className="border border-slate-850 bg-slate-950/20 rounded-lg p-5 flex flex-col justify-between h-40 shadow-sm relative group"
                >
                    <div>
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-slate-500" />
                                <h3 className="text-xs font-semibold text-slate-400 line-clamp-1">
                                    {doc.title}
                                </h3>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={(e) => handleRestoreFromTrash(e, doc.id)}
                                    className="p-1 text-slate-650 hover:text-green-400 hover:bg-slate-855 rounded transition cursor-pointer"
                                    title="Restore Document"
                                >
                                    <RotateCcw size={13} />
                                </button>
                                <button
                                    onClick={(e) => handlePermanentDelete(e, doc.id)}
                                    className="p-1 text-slate-655 hover:text-red-400 hover:bg-slate-855 rounded transition cursor-pointer"
                                    title="Delete Permanently"
                                >
                                    <X size={13} />
                                </button>
                            </div>
                        </div>
                        <p className="mt-2 text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {formatSnippet(doc.content)}
                        </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-600">
                        <div className="flex items-center gap-1">
                            <Calendar size={11} />
                            <span>{formatTimestamp(doc.updatedAt)}</span>
                        </div>
                        <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                            Trashed
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TrashGrid;
