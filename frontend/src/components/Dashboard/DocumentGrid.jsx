import React from 'react';
import { FileText, Trash2, Calendar, Users } from 'lucide-react';

const DocumentGrid = ({ 
    documents, 
    isShared, 
    formatSnippet, 
    formatTimestamp, 
    getOwnerInitials, 
    getOwnerName, 
    handleMoveToTrash, 
    navigate 
}) => {
    if (documents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-lg p-16 text-center">
                {isShared ? (
                    <Users size={40} className="text-slate-600 mb-3" />
                ) : (
                    <FileText size={40} className="text-slate-600 mb-3" />
                )}
                <h3 className="text-sm font-semibold text-slate-300">
                    {isShared ? 'No shared documents' : 'No documents found'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                    {isShared 
                        ? 'Shared notebooks will display here automatically.' 
                        : 'Create a new collaborative sheet to get started.'}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
                <div
                    key={doc._id}
                    onClick={() => navigate(`/document/${doc._id}`)}
                    className="border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-700 rounded-lg p-5 transition flex flex-col justify-between h-40 cursor-pointer shadow-sm group"
                >
                    <div>
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className={isShared ? 'text-purple-500' : 'text-blue-500'} />
                                <h3 className="text-xs font-semibold text-slate-200 line-clamp-1 group-hover:text-blue-400 transition">
                                    {doc.title}
                                </h3>
                            </div>
                            
                            {!isShared ? (
                                <button
                                    onClick={(e) => handleMoveToTrash(e, doc._id)}
                                    className="p-1 text-slate-600 hover:text-red-400 hover:bg-slate-800 rounded transition cursor-pointer"
                                    title="Move to Trash"
                                >
                                    <Trash2 size={13} />
                                </button>
                            ) : (
                                <span className="text-[9px] uppercase tracking-wider font-semibold text-purple-400 bg-purple-950/40 px-1.5 py-0.5 rounded">
                                    Collaborator
                                </span>
                            )}
                        </div>
                        <p className="mt-2 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {formatSnippet(doc.content)}
                        </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                        <div className="flex items-center gap-1">
                            <Calendar size={11} />
                            <span>{formatTimestamp(doc.updatedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {doc.collaborators?.length > 0 && (
                                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-medium">
                                    {doc.collaborators.length} collaborators
                                </span>
                            )}
                            <div 
                                className={`h-5 w-5 flex items-center justify-center rounded-full text-[8px] font-bold ${
                                    isShared ? 'bg-purple-950 text-purple-300' : 'bg-slate-800 text-slate-400'
                                }`} 
                                title={`Owner: ${getOwnerName(doc)}`}
                            >
                                {getOwnerInitials(doc)}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DocumentGrid;
