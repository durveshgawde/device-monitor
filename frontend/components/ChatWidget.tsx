'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/utils/api';

interface Message {
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load chat history when opened
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            loadChatHistory();
        }
    }, [isOpen]);

    async function loadChatHistory() {
        try {
            const history = await api.getChatHistory();
            const formattedMessages = history
                .reverse()
                .flatMap(msg => [
                    { type: 'user' as const, content: msg.user_message, timestamp: new Date(msg.created_at) },
                    { type: 'assistant' as const, content: msg.ai_response, timestamp: new Date(msg.created_at) }
                ])
                .slice(-10); // Last 10 messages

            setMessages(formattedMessages);
        } catch (err) {
            console.error('Failed to load chat history:', err);
        }
    }

    async function handleSendMessage() {
        if (!input.trim()) return;

        const userMessage = input;
        setInput('');
        setError(null);

        setMessages(prev => [...prev, {
            type: 'user',
            content: userMessage,
            timestamp: new Date()
        }]);

        try {
            setLoading(true);
            const response = await api.getChat(userMessage);

            setMessages(prev => [...prev, {
                type: 'assistant',
                content: response.response,
                timestamp: new Date()
            }]);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.message || 'Failed to get response. Please try again.';
            setError(errorMessage);
            console.error('Chat error:', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 right-4 inline-flex items-center justify-center rounded-full w-16 h-16 bg-cyan-500 text-white hover:bg-gray-900 hover:text-white shadow-lg transition-all duration-300 ease-out hover:bg-cyan-600 hover:shadow-[0_0_28px_rgba(6,182,212,0.65)]"
                type="button"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black hover:text-white">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black hover:text-white">
                        <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
                    </svg>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div
                    className="fixed bottom-24 right-4 bg-white rounded-lg border border-gray-200 w-[440px] h-[634px] shadow-xl z-50 flex flex-col"
                    style={{ animation: 'slideUp 0.2s ease-out' }}
                >
                    {/* Header */}
                    <div className="flex flex-col space-y-1.5 p-6 border-b">
                        <h2 className="font-semibold text-lg tracking-tight text-gray-900">💬 System Monitor AI</h2>
                        <p className="text-sm text-gray-500 leading-3">Ask about your system metrics</p>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && !loading && (
                            <div className="flex gap-3 text-gray-600 text-sm">
                                <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
                                    <div className="rounded-full bg-gray-100 border p-1">
                                        <svg stroke="none" fill="black" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"></path>
                                        </svg>
                                    </div>
                                </span>
                                <p className="leading-relaxed">
                                    <span className="block font-bold text-gray-700">AI</span>
                                    Hi! Ask me about your system metrics.
                                </p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className="flex gap-3 text-gray-600 text-sm">
                                <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
                                    <div className="rounded-full bg-gray-100 border p-1">
                                        {msg.type === 'assistant' ? (
                                            <svg stroke="none" fill="black" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"></path>
                                            </svg>
                                        ) : (
                                            <svg stroke="none" fill="black" strokeWidth="0" viewBox="0 0 16 16" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"></path>
                                            </svg>
                                        )}
                                    </div>
                                </span>
                                <p className="leading-relaxed">
                                    <span className="block font-bold text-gray-700">{msg.type === 'assistant' ? 'AI' : 'You'}</span>
                                    {msg.content}
                                </p>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-3 text-gray-600 text-sm">
                                <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
                                    <div className="rounded-full bg-gray-100 border p-1">
                                        <svg stroke="none" fill="black" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"></path>
                                        </svg>
                                    </div>
                                </span>
                                <p className="leading-relaxed">
                                    <span className="block font-bold text-gray-700">AI</span>
                                    ⏳ Thinking...
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-900 p-3 rounded-lg text-sm">
                                ❌ {error}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t p-4">
                        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center space-x-2">
                            <input
                                type="text"
                                placeholder="Ask about your system..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={loading}
                                className="flex-1 h-10 rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium text-white bg-black hover:bg-gray-800 h-10 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
}
