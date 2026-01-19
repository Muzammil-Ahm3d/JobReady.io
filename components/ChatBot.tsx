'use client';

import { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaCommentDots } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
    role: 'user' | 'bot';
    text: string;
    source?: 'local' | 'ai';
};

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'bot', text: 'Hi! I can help you find answers. Ask me anything!' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return;

        const userText = query;
        setQuery('');
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userText }),
            });
            const data = await res.json();

            if (res.ok) {
                setMessages(prev => [...prev, {
                    role: 'bot',
                    text: data.answer,
                    source: data.source
                }]);
            } else {
                setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I encountered an error searching for that.' }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'bot', text: 'Network error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000, fontFamily: 'sans-serif' }}>
            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    bottom: '4rem',
                    right: '0',
                    width: '350px',
                    height: '500px',
                    backgroundColor: 'var(--background-card)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: '1px solid var(--border-subtle)'
                }}>
                    {/* Header */}
                    <div style={{ background: 'var(--primary)', color: 'var(--text-on-primary)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaRobot size={20} />
                            <span style={{ fontWeight: 600 }}>JobReady Bot</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-on-primary)', cursor: 'pointer' }}>
                            <FaTimes size={16} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: 'var(--background-page)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{
                                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '80%',
                                background: m.role === 'user' ? 'var(--primary)' : 'var(--background-card)',
                                color: m.role === 'user' ? 'var(--text-on-primary)' : 'var(--text-main)',
                                padding: '0.75rem 1rem',
                                borderRadius: '12px',
                                borderBottomRightRadius: m.role === 'user' ? '2px' : '12px',
                                borderBottomLeftRadius: m.role === 'bot' ? '2px' : '12px',
                                boxShadow: m.role === 'bot' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                                fontSize: '0.9rem',
                                lineHeight: '1.5'
                            }}>
                                <div className="markdown-content text-sm">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {m.text}
                                    </ReactMarkdown>
                                </div>
                                {m.source === 'ai' && (
                                    <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.25rem', fontStyle: 'italic' }}>
                                        ✨ Generated by AI
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div style={{ alignSelf: 'flex-start', background: 'var(--background-card)', padding: '0.75rem', borderRadius: '12px', color: 'var(--text-muted)' }}>
                                <FaCommentDots className="animate-pulse" /> Thinking...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSearch} style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--background-card)', display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask a question..."
                            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', outline: 'none' }}
                        />
                        <button type="submit" disabled={isLoading} style={{ background: 'var(--primary)', color: 'var(--text-on-primary)', border: 'none', borderRadius: '8px', width: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaPaperPlane />
                        </button>
                    </form>
                </div>
            )
            }

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: 'var(--text-on-primary)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0, 102, 204, 0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                {isOpen ? <FaTimes size={24} /> : <FaRobot size={28} />}
            </button>
        </div >
    );
}
