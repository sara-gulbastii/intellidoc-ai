import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AIService } from './services/aiService'; // ← changed
import { extractTextFromPdf, chunkText, searchRelevantChunks } from './services/pdfService';
import { Message, Document } from './types';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const aiRef = useRef<AIService | null>(null); // ← renamed from geminiRef

  useEffect(() => {
    aiRef.current = new AIService();
    
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hi! I'm your Intelligent Document Assistant. Upload one or more PDFs in the sidebar, and I'll help you extract insights and answer questions based on their content.",
        timestamp: Date.now(),
      }
    ]);
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newDocs: Document[] = [];

    for (const file of Array.from(files) as File[]) {
      if (file.type !== 'application/pdf') continue;

      const docId = uuidv4();
      try {
        const text = await extractTextFromPdf(file);
        const chunks = chunkText(text);
        
        newDocs.push({
          id: docId,
          name: file.name,
          size: file.size,
          text,
          chunks,
          status: 'ready'
        });
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
      }
    }

    setDocuments(prev => [...prev, ...newDocs]);
    setIsProcessing(false);
    
    if (newDocs.length > 0) {
      const assistantMsg: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: `Successfully processed ${newDocs.length} document(s). You can now ask me questions about: ${newDocs.map(d => d.name).join(', ')}.`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      if (!aiRef.current) throw new Error("AI service not initialized");

      const relevantChunks = searchRelevantChunks(content, documents);
      
      const response = await aiRef.current.generateAnswer(content, relevantChunks, messages);

      const assistantMsg: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        sources: response.sources
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: "I encountered an error while processing your request. Please try again.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        documents={documents}
        onUpload={handleFileUpload}
        onRemove={removeDocument}
        isProcessing={isProcessing}
      />
      
      <main className="flex-1 flex flex-col relative h-full">
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center px-8 justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              AI
            </div>
            <h1 className="font-semibold text-slate-800">IntelliDoc AI</h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${documents.length > 0 ? 'bg-green-500' : 'bg-amber-500'}`}></span>
              {documents.length} Docs Loaded
            </span>
          </div>
        </header>

        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
        />
      </main>
    </div>
  );
};

export default App;
