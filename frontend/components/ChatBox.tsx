'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/utils/api';

interface Message {
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function ChatBox() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load chat history on mount
    useEffect(() => {
        loadChatHistory();
    }, []);

    async function loadChatHistory() {
        try {
            const history = await api.getChatHistory();
            const formattedMessages = history
                .reverse()
                .flatMap(msg => [
                    { type: 'user' as const, content: msg.user_message, timestamp: new Date(msg.created_at) },
                    { type: 'assistant' as const, content: msg.ai_response, timestamp: new Date(msg.created_at) }
                ])
                .slice(-20); // Last 20 messages

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

        // Add user message
        setMessages(prev => [...prev, {
            type: 'user',
            content: userMessage,
            timestamp: new Date()
        }]);

        try {
            setLoading(true);
            const response = await api.getChat(userMessage);

            // Add AI response
            setMessages(prev => [...prev, {
                type: 'assistant',
                content: response.response,
                timestamp: new Date()
            }]);
        } catch (err: any) {
            // Display specific error message from backend
            const errorMessage = err.response?.data?.error || err.message || 'Failed to get response. Please try again.';
            setError(errorMessage);
            console.error('Chat error:', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                <h2 className="text-2xl font-bold">💬 System Monitor Chatbot</h2>
                <p className="text-blue-100 text-sm mt-1">Ask me anything about your system metrics</p>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">👋 Hi! Ask me about your system metrics</p>
                        <p className="text-gray-400 text-sm mt-2">Examples:</p>
                        <ul className="text-gray-400 text-sm mt-2 space-y-1">
                            <li>• What does P95 latency mean?</li>
                            <li>• Why is my CPU usage high?</li>
                            <li>• How can I optimize memory?</li>
                            <li>• What is load average?</li>
                        </ul>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-md px-4 py-3 rounded-lg ${msg.type === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                    }`}
                            >
                                <p className="text-sm">{msg.content}</p>
                                <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                                    }`}>
                                    {msg.timestamp.toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    ))
                )}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg">
                            <p className="text-sm">⏳ Thinking...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 text-red-900 p-3 rounded-lg">
                        <p className="text-sm">❌ {error}</p>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Ask about your system..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={loading}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-900"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={loading || !input.trim()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                    >
                        {loading ? '⏳' : '📤'}
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Powered by AI • Your metrics context is included in responses
                </p>
            </div>
        </div>
    );
}
