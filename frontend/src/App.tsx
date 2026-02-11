import React, { useState, useEffect, useRef } from 'react';
import { api, ChatMessage } from './api';
import { MessageBubble } from './components/MessageBubble';
import { TypingIndicator } from './components/TypingIndicator';
import { ChatInput } from './components/ChatInput';
import { JiraBuddyAvatar } from './components/JiraBuddyAvatar';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // Immediate scroll
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage];
      const response = await api.chat(conversationHistory);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Could not connect to the chatbot.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-gray-200">
      <div className="max-w-3xl mx-auto flex flex-col min-h-screen border-x border-gray-100 bg-white shadow-sm">

        {/* Header - Minimalist */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <JiraBuddyAvatar size="sm" />
            <div>
              <h1 className="text-base font-semibold tracking-tight text-gray-900">Jira Buddy</h1>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
          {/* Optional: Add minimal actions here if needed */}
        </header>

        {/* Chat Area */}
        <div className="flex-1 p-4 md:p-6 space-y-6 pb-32">
          <AnimatePresence initial={false}>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-20 text-center px-4"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <JiraBuddyAvatar size="md" />
                </div>
                <h2 className="text-xl font-medium text-gray-900 mb-2">How can I help you?</h2>
                <p className="text-gray-500 max-w-sm mx-auto text-sm">
                  Manage your Jira projects, find issues, or create tickets with simple commands.
                </p>
              </motion.div>
            )}

            {messages.map((msg, idx) => (
              <MessageBubble key={idx} message={msg} />
            ))}

            {isLoading && <TypingIndicator />}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 md:p-6">
          <ChatInput
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            onSubmit={handleSubmit}
          />
          <div className="text-center mt-2">
            <p className="text-[10px] text-gray-400">AI responses may be inaccurate.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
