import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { ModeSelector } from './ModeSelector';
import { ContextPanel } from './ContextPanel';
import { MemoryPanel } from './MemoryPanel';
import { SettingsModal } from './SettingsModal';
import { useCharlie } from '../hooks/useCharlie';

export default function AppLayout() {
  const { messages, context, memories, settings, mode, isTyping, sendMessage, setMode, updateSettings, exportData } = useCharlie();
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'context' | 'memory'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
      {/* Hero Header */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src="https://d64gsuwffb70l.cloudfront.net/68e6932b097edb8f11865985_1759941463955_94cdbe33.webp"
          alt="Charlie AI Background"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <img 
              src="https://d64gsuwffb70l.cloudfront.net/68e6932b097edb8f11865985_1759941463166_5459c7b5.webp"
              alt="Charlie Avatar"
              className="w-24 h-24 mx-auto mb-4 rounded-full animate-pulse"
            />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Charlie
            </h1>
            <p className="text-gray-300 text-lg italic">Your AI Assistant & Creative Collaborator</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="space-y-6">
            <ContextPanel context={context} />
            <MemoryPanel memories={memories} />
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/80 border border-purple-500/30 rounded-2xl overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gray-800/50 border-b border-purple-500/20 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-purple-300">Conversation</h2>
                  <div className="flex gap-2">
                    <button onClick={exportData} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300">
                      Export
                    </button>
                    <button onClick={() => setShowSettings(true)} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300">
                      ⚙️ Settings
                    </button>
                  </div>
                </div>
                <ModeSelector currentMode={mode} onModeChange={setMode} />
              </div>

              {/* Messages */}
              <div className="h-[500px] overflow-y-auto p-6">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 mt-20">
                    <p className="text-lg mb-2">Start a conversation with Charlie</p>
                    <p className="text-sm">Ask about your projects, get strategic advice, or brainstorm ideas</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                {isTyping && (
                  <div className="flex gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">C</span>
                    </div>
                    <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="border-t border-purple-500/20 p-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message Charlie..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl text-white font-medium transition-all"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={updateSettings}
      />
    </div>
  );
}
