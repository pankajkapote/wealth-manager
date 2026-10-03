'use client';

import React, { useState } from 'react';
import { TrendingUp, Wallet, BarChart3, Zap, Menu, X } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';

// Minimal safe imports - remove problematic components
import MarketTicker from '@/components/MarketTicker';

function Dashboard() {
  const [selectedView, setSelectedView] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hardcoded minimal data - SAFE (no undefined)
  const portfolio = {
    totalValue: 0,
    gainPercentage: 0,
    totalGains: 0,
    holdingsCount: 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-800/90 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Wealth Manager</h1>
                <p className="text-xs text-slate-400">AI Portfolio Advisor</p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-slate-700 rounded-lg transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          <MarketTicker />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Sidebar & Main */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation */}
          <div className={`lg:col-span-1 ${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <nav className="space-y-2 bg-slate-800/50 rounded-lg p-4">
              <NavItem
                icon={<Wallet className="w-5 h-5" />}
                label="Overview"
                active={selectedView === 'overview'}
                onClick={() => {
                  setSelectedView('overview');
                  setMobileMenuOpen(false);
                }}
              />
              <NavItem
                icon={<BarChart3 className="w-5 h-5" />}
                label="Health"
                active={selectedView === 'health'}
                onClick={() => {
                  setSelectedView('health');
                  setMobileMenuOpen(false);
                }}
              />
              <NavItem
                icon={<Zap className="w-5 h-5" />}
                label="AI Chat"
                active={selectedView === 'chat'}
                onClick={() => {
                  setSelectedView('chat');
                  setMobileMenuOpen(false);
                }}
              />
            </nav>
          </div>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {selectedView === 'overview' && <OverviewView portfolio={portfolio} />}
            {selectedView === 'health' && <HealthView />}
            {selectedView === 'chat' && <ChatView />}
          </main>
        </div>
      </div>

      <footer className="border-t border-slate-700 mt-12 py-6 px-4 text-center text-slate-400 text-sm">
        <p>Personal AI Wealth Manager • Powered by Gemini + Groq</p>
      </footer>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-slate-300 hover:bg-slate-700'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function OverviewView({ portfolio }: { portfolio: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Portfolio Overview</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Value"
          value={`₹${(portfolio.totalValue || 0).toLocaleString('en-IN')}`}
          change={`${portfolio.gainPercentage || 0}%`}
        />
        <StatCard
          label="Unrealized Gains"
          value={`₹${(portfolio.totalGains || 0).toLocaleString('en-IN')}`}
          change={`${portfolio.holdingsCount || 0} holdings`}
        />
        <StatCard
          label="Status"
          value="Ready"
          change="Add holdings to get started"
        />
      </div>

      {/* Empty State */}
      <div className="bg-slate-800/50 rounded-lg p-12 text-center">
        <Wallet className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No holdings yet</h3>
        <p className="text-slate-400">Add stocks and mutual funds to track your portfolio</p>
      </div>
    </div>
  );
}

function HealthView() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Portfolio Health</h2>
      <div className="bg-slate-800/50 rounded-lg p-6">
        <p className="text-slate-400">Add holdings to see health metrics</p>
      </div>
    </div>
  );
}

function ChatView() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMsg }],
          portfolio_context: {
            totalValue: 0,
            totalInvested: 0,
            totalGains: 0,
            gainPercentage: 0,
            holdingsCount: 0,
          },
        }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message || 'Error' }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Failed to get response' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-slate-800/50 rounded-lg overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 py-12">
            <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Chat with your AI advisor</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-xs ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-100'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && <p className="text-slate-400 text-sm">Thinking...</p>}
      </div>

      {/* Input */}
      <div className="border-t border-slate-700 p-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask me anything..."
          disabled={loading}
          className="flex-1 bg-slate-700 text-white rounded px-3 py-2 focus:outline-none text-sm"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4">
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className="text-slate-400 text-xs mt-2">{change}</p>
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}
