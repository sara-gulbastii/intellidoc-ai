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
  const aiRef = useRef<AIService | null>(null);

  useEffect(() => {
    try {
      aiRef.current = new AIService();
    } catch (e) {
      console.error("AI Service init failed", e);
    }

    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hi! I'm IntelliDoc AI — your document intelligence assistant. Upload PDFs in the sidebar and ask any question.",
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
        content: `Processed ${newDocs.length} document(s): ${newDocs.map(d => d.name).join(', ')}. Ask me anything!`,
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
      if (!aiRef.current) throw new Error("AI service not ready");

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
        content: "Sorry, something went wrong. Check your API key or try again.",
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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar
        documents={documents}
        onUpload={handleFileUpload}
        onRemove={removeDocument}
        isProcessing={isProcessing}
      />

      <main className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-slate-200 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              ID
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">IntelliDoc AI</h1>
              <p className="text-sm text-slate-600">Intelligent Document Assistant</p>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            {documents.length} document{documents.length !== 1 ? 's' : ''} loaded
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
