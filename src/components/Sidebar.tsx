import React from 'react';
import { Document } from '../types';

interface SidebarProps {
  documents: Document[];
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (id: string) => void;
  isProcessing: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ documents, onUpload, onRemove, isProcessing }) => {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      <div className="p-6">
        <h2 className="text-white font-bold text-xl mb-6">Knowledge Base</h2>
        
        <div className="space-y-4">
          <div className="relative">
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={onUpload}
              className="hidden"
              id="pdf-upload"
              disabled={isProcessing}
            />
            <label
              htmlFor="pdf-upload"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-slate-800/50 transition-all duration-200 ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? (
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <span className="text-sm text-slate-400">Processing...</span>
                </div>
              ) : (
                <>
                  <svg className="w-8 h-8 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm text-slate-400 font-medium">Upload PDF Documents</span>
                  <span className="text-xs text-slate-600 mt-1">Multi-select supported</span>
                </>
              )}
            </label>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4 px-2">Uploaded Files</h3>
        <div className="space-y-2">
          {documents.length === 0 && !isProcessing && (
            <div className="px-2 py-4 text-center">
              <p className="text-slate-600 text-sm italic">No documents uploaded yet.</p>
            </div>
          )}
          
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="group flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition-colors"
            >
              <div className="w-8 h-8 shrink-0 bg-red-500/10 text-red-500 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 2a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V8l-6-6H7zm7 1.5L18.5 9H14V3.5zM8 12h8v2H8v-2zm0 4h8v2H8v-2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 text-sm font-medium truncate leading-tight">{doc.name}</p>
                <p className="text-slate-500 text-[10px] mt-0.5">{formatSize(doc.size)}</p>
              </div>
              <button
                onClick={() => onRemove(doc.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 border-t border-slate-800 bg-slate-900/50">
        <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-blue-400 text-xs leading-relaxed">
            <strong className="block mb-1">Advanced RAG Engine</strong>
            Intelligent retrieval and synthesis from your uploaded documents for accurate, context-aware answers.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
