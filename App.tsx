import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AIService } from './services/aiService';
import { extractTextFromPdf, chunkText, searchRelevantChunks } from './services/pdfService';
import { Message, Document } from './types';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const aiRef = useRef<AIService | null>(null);

  useEffect(() => {
    aiRef.current = new AIService();
    
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hi! I'm IntelliDoc AI. Upload PDFs and ask questions — I'll answer from your documents only.",
        timestamp: Date.now(),
      }
    ]);
  }, []);

  // ... keep your handleFileUpload, handleSendMessage, removeDocument functions exactly as before

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} overflow-hidden`}>
      <Sidebar
        documents={documents}
        onUpload={handleFileUpload}
        onRemove={removeDocument}
        isProcessing={isProcessing}
        darkMode={darkMode}
      />
      
      <main className="flex-1 flex flex-col">
        <header className={`h-16 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/80 border-gray-200'} backdrop-blur-md flex items-center px-6 justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
              ID
            </div>
            <div>
              <h1 className="text-xl font-bold">IntelliDoc AI</h1>
              <p className="text-xs opacity-75">Document Intelligence Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${documents.length > 0 ? 'bg-green-500' : 'bg-amber-500'}`}></span>
              {documents.length} docs
            </span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {darkMode ? '🌞' : '🌙'}
            </button>
          </div>
        </header>

        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
          darkMode={darkMode}
        />
      </main>
    </div>
  );
};

export default App;
