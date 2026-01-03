import React from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        documents={[]}
        onUpload={() => alert('Upload clicked')}
        onRemove={() => {}}
        isProcessing={false}
      />
      <div className="flex-1 p-10">
        <h1 className="text-4xl font-bold mb-4">IntelliDoc AI</h1>
        <p className="text-xl mb-8">Test chat below — if this shows, components are working.</p>
        <ChatInterface
          messages={[
            { id: '1', role: 'assistant', content: 'Hello! The app is loading correctly now.', timestamp: Date.now() }
          ]}
          onSendMessage={(msg) => alert('Message: ' + msg)}
          isTyping={false}
        />
      </div>
    </div>
  );
};

export default App;
