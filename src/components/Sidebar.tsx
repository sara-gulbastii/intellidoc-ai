import React from 'react';
import { Document } from '../types';

interface SidebarProps {
  documents: Document[];
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (id: string) => void;
  isProcessing: boolean;
  darkMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ documents, onUpload, onRemove, isProcessing, darkMode }) => {
  const formatSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <aside className={`w-80 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-r flex flex-col`}>
      <div className="p-6">
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Knowledge Base</h2>
        
        <div className="relative group">
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
            className={`block p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
              isProcessing 
                ? 'border-gray-400 opacity-50' 
                : 'border-blue-500 hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800'
            } ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm">Processing PDFs...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <svg className="w-12 h-12 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="font-medium">Drop PDFs here or click to upload</p>
                <p className="text-xs opacity-75">Multiple files supported</p>
              </div>
            )}
          </label>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 px-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Uploaded Documents</h3>
        <div className="space-y-2">
          {documents.length === 0 && !isProcessing && (
            <p className={`text-center py-8 text-sm italic ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              No documents yet. Upload to begin.
            </p>
          )}
          {documents.map((doc) => (
            <div key={doc.id} className={`group flex items-center gap-3 p-3 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} transition-all`}>
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 2a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>{doc.name}</p>
                <p className="text-xs opacity-75">{formatSize(doc.size)}</p>
              </div>
              <button
                onClick={() => onRemove(doc.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={`p-6 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl p-4 shadow-lg">
          <p className="text-sm font-medium">
            <strong>Advanced RAG Engine Active</strong>
          </p>
          <p className="text-xs mt-1 opacity-90">
            Answers grounded in your documents • No hallucinations
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
