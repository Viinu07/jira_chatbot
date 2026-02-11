import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { api, ChatMessage } from './api';

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send the entire conversation history context
      // Filter out system messages from frontend state if we had any, 
      // but here we only store user/assistant.
      const conversationHistory = [...messages, userMessage];

      const response = await api.chat(conversationHistory);

      // The backend returns { role: 'assistant', content: '...' }
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Could not connect to the chatbot.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Extensions to api.ts to support chat
  // We need to patch api.ts or just cast it here if we want to save file writes.
  // Actually, I defined 'chat' as a future method in api.ts but didn't implement it.
  // I should update api.ts first or assume I will update it. 
  // Let's rely on the previous tool call to update api.ts... wait, I commented it out. 
  // I need to update api.ts to include the chat method.

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="flex items-center p-4 bg-gray-800 border-b border-gray-700 shadow-md">
        <Bot className="w-8 h-8 text-blue-400 mr-3" />
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
          Jira Chatbot
        </h1>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-60">
            <Bot className="w-16 h-16 mb-4" />
            <p className="text-lg">Start a conversation to interact with Jira.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-[80%] rounded-2xl px-4 py-3 shadow-lg 
              ${msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-gray-700 text-gray-100 rounded-bl-none border border-gray-600'}
            `}>
              <div className="flex items-start gap-2">
                {msg.role === 'assistant' && <Bot className="w-5 h-5 mt-1 shrink-0 text-blue-400" />}
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.role === 'user' && <User className="w-5 h-5 mt-1 shrink-0 text-blue-200" />}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-2xl px-4 py-3 rounded-bl-none border border-gray-600 flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" />
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              <span className="text-gray-400 text-sm">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your request... (e.g., 'Find bugs in project TEST')"
            className="flex-1 bg-gray-900 border border-gray-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-blue-500/20"
          >
            <Send className="w-5 h-5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
