'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertCircle, BarChart3 } from 'lucide-react';
import { usePortfolioData } from '@/lib/usePortfolioData';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIInsights() {
  const { summary, stocks, mfs } = usePortfolioData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus textarea
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    // Add user message
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage },
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          portfolio_context: summary ? {
            totalValue: summary.totalValue,
            totalInvested: summary.totalInvested,
            totalGains: summary.totalGains,
            gainPercentage: summary.gainPercentage,
            holdingsCount: summary.holdingsCount,
            stockCount: summary.stockCount,
            mfCount: summary.mfCount,
            topGainers: summary.topGainers,
            topLosers: summary.topLosers,
          } : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setMessages([
        ...newMessages,
        { role: 'assistant', content: data.message },
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to get response');
      setMessages(newMessages);
    } finally {
      setLoading(false);
    }
  };

  const isEmpty = stocks.length === 0 && mfs.length === 0;

  return (
    <div className="flex flex-col h-96 bg-gradient-to-br from-slate-900/20 to-slate-800/20 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900/60 border-b border-slate-700 px-4 py-3">
        <h3 className="font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-invest-accent" />
          AI Portfolio Analyst
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          {isEmpty
            ? 'Add holdings to get personalized insights'
            : 'Ask questions about your portfolio'}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isEmpty && (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm mb-4">Ask me about your portfolio:</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                'What are my top performers?',
                'Should I diversify more?',
                'Is my portfolio balanced?',
                'What are the risks?',
              ].map((question, i) => (
                <button
                  key={i}
                  onClick={() => setInput(question)}
                  className="text-xs p-2 rounded bg-slate-800/50 hover:bg-slate-700 transition text-left"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {isEmpty && (
          <div className="text-center py-12 text-slate-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Add your holdings to start getting insights</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg text-sm ${
                msg.role === 'user'
                  ? 'bg-invest-accent text-white'
                  : 'bg-slate-800 text-slate-100'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 px-4 py-2 rounded-lg flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-slate-300">Thinking...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!isEmpty && (
        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-700 bg-slate-900/40 p-3 flex gap-2"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            placeholder="Ask about your portfolio..."
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-invest-accent"
            rows={1}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary p-2 flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      )}
    </div>
  );
}
