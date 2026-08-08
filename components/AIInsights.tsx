'use client';

import React, { useState, useMemo } from 'react';
import { Zap, MessageSquare } from 'lucide-react';
import { usePortfolioData } from '@/lib/usePortfolioData';
import PortfolioOnboarding from './PortfolioOnboarding';

interface DerivedInsight {
  id: string;
  type: 'TOP_GAINER' | 'TOP_LOSER' | 'CONCENTRATION' | 'INFO';
  title: string;
  description: string;
}

export default function AIInsights() {
  const { familyMemberId, stocks, summary, loading, isEmpty, refresh } =
    usePortfolioData();
  const [aiChat, setAiChat] = useState<Array<{ role: string; text: string }>>([]);
  const [userInput, setUserInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Real, computed observations from actual holdings — not scripted examples.
  const insights: DerivedInsight[] = useMemo(() => {
    if (stocks.length === 0) return [];
    const list: DerivedInsight[] = [];

    const sorted = [...stocks].sort(
      (a, b) => b.unrealized_gain_loss_pct - a.unrealized_gain_loss_pct
    );
    const topGainer = sorted[0];
    const topLoser = sorted[sorted.length - 1];

    if (topGainer && topGainer.unrealized_gain_loss_pct > 0) {
      list.push({
        id: 'top-gainer',
        type: 'TOP_GAINER',
        title: `${topGainer.symbol} is your best performer`,
        description: `Up ${topGainer.unrealized_gain_loss_pct.toFixed(1)}% from your average cost of ₹${topGainer.avg_cost_price.toFixed(2)}.`,
      });
    }

    if (topLoser && topLoser.unrealized_gain_loss_pct < 0) {
      list.push({
        id: 'top-loser',
        type: 'TOP_LOSER',
        title: `${topLoser.symbol} is your weakest performer`,
        description: `Down ${Math.abs(topLoser.unrealized_gain_loss_pct).toFixed(1)}% from your average cost. Worth reviewing why, and asking the AI below whether it still fits your thesis.`,
      });
    }

    if (summary.topHoldings[0] && summary.totalValue > 0) {
      const pct = (summary.topHoldings[0].value_at_market / summary.totalValue) * 100;
      if (pct > 15) {
        list.push({
          id: 'concentration',
          type: 'CONCENTRATION',
          title: `${summary.topHoldings[0].symbol} is ${pct.toFixed(0)}% of your portfolio`,
          description:
            'A single holding above ~15% increases concentration risk. Not necessarily wrong if it\'s a high-conviction position — but worth a deliberate check.',
        });
      }
    }

    return list;
  }, [stocks, summary]);

  const handleAskAI = async (question: string) => {
    if (!question.trim()) return;

    const newChat = [...aiChat, { role: 'user', text: question }];
    setAiChat(newChat);
    setUserInput('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          context: {
            portfolio: {
              totalValue: summary.totalValue,
              totalInvested: summary.totalInvested,
              holdings: summary.holdingsCount,
            },
            recentInsights: insights.map((i) => ({
              title: i.title,
              description: i.description,
              type: i.type,
            })),
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAiChat([...newChat, { role: 'assistant', text: data.response }]);
      } else {
        setAiChat([
          ...newChat,
          {
            role: 'assistant',
            text: `⚠️ ${data.message || data.error || 'Something went wrong talking to Claude.'}`,
          },
        ]);
      }
    } catch (error) {
      setAiChat([
        ...newChat,
        {
          role: 'assistant',
          text: '⚠️ Could not reach the server. Check your connection and try again.',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-dark rounded-lg p-8 text-center text-slate-400 text-sm">
        Loading...
      </div>
    );
  }

  if (isEmpty && familyMemberId) {
    return (
      <PortfolioOnboarding familyMemberId={familyMemberId} onComplete={refresh} />
    );
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      TOP_GAINER: 'border-l-green-500 bg-green-900/10',
      TOP_LOSER: 'border-l-red-500 bg-red-900/10',
      CONCENTRATION: 'border-l-yellow-500 bg-yellow-900/10',
      INFO: 'border-l-blue-500 bg-blue-900/10',
    };
    return colors[type] || 'border-l-blue-500 bg-blue-900/10';
  };

  return (
    <div className="space-y-6">
      {/* AI Chat */}
      <div className="glass-dark rounded-lg p-6 flex flex-col h-96">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-invest-accent" />
          Ask Your Wealth Manager
        </h3>

        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {aiChat.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm mb-2">Ask me anything about your portfolio</p>
              <p className="text-xs">
                "Is my portfolio too concentrated?" • "What should I review first?"
              </p>
            </div>
          ) : (
            aiChat.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-invest-accent text-white'
                      : 'bg-slate-700 text-slate-100'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-700 px-4 py-2 rounded-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskAI(userInput)}
            placeholder="Ask about your portfolio..."
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-invest-accent"
            disabled={chatLoading}
          />
          <button
            onClick={() => handleAskAI(userInput)}
            disabled={chatLoading || !userInput.trim()}
            className="bg-invest-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            Send
          </button>
        </div>
      </div>

      {/* Insights derived from real holdings */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-invest-accent" />
          Observations From Your Holdings
        </h3>
        {insights.length === 0 ? (
          <p className="text-sm text-slate-400">
            Nothing notable yet — add more holdings or check back after prices update.
          </p>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border-l-4 ${getTypeColor(insight.type)}`}
              >
                <h4 className="font-semibold text-base">{insight.title}</h4>
                <p className="text-sm text-slate-300 mt-1">{insight.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
