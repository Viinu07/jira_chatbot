import React, { useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    isLoading: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, isLoading, onSubmit }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!isLoading) {
            textareaRef.current?.focus();
        }
    }, [isLoading]);

    // Auto-resize
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    }, [input]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit(e);
        }
    };

    return (
        <div className="relative">
            <div className="relative bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-200 focus-within:ring-1 focus-within:ring-gray-300 focus-within:border-gray-300">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full bg-transparent text-gray-900 px-4 py-3 pr-12 focus:outline-none placeholder-gray-400 resize-none max-h-[120px] rounded-xl text-sm"
                    disabled={isLoading}
                    style={{ minHeight: '46px' }}
                />

                <div className="absolute bottom-2 right-2">
                    <button
                        onClick={(e) => onSubmit(e)}
                        disabled={isLoading || !input.trim()}
                        className="bg-gray-900 hover:bg-black disabled:opacity-30 disabled:hover:bg-gray-900 text-white p-1.5 rounded-lg transition-colors duration-200"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin m-0.5" />
                        ) : (
                            <ArrowUp size={16} strokeWidth={2.5} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
