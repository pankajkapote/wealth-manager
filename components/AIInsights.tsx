'use client';

import React, { useState } from 'react';
import { Zap, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react';

export default function AIInsights() {
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [aiChat, setAiChat] = useState<Array<{ role: string; text: string }>>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

  const insights = [
    {
      id: 'yes-bank-exit',
      type: 'SELL_ALERT',
      title: 'YES Bank: Review Exit Position',
      description: 'Down 92% from cost. Consider further reduction.',
      confidence: 0.95,
      reasoning: [
        'Stock down 92% from cost (₹301 to ₹22.94)',
        'Negative momentum for 18+ months',
        'Better opportunities in ICICI Bank and Hcl Finance',
        'Psychological weight outweighs potential upside',
      ],
      recommendation: 'Reduce by 50% immediately. Exit remaining position on any bounce.',
      actionRequired: true,
    },
    {
      id: 'lt-accumulation',
      type: 'OPPORTUNITY',
      title: 'L&T: Good Accumulation Zone',
      description: 'PE near 5-year low. Quality company showing resilience.',
      confidence: 0.88,
      reasoning: [
        'Current PE = 22 vs historical avg 28',
        'Strong order book for next 3 years',
        'Dividend yield = 2.5% (stable)',
        'Perfect for adding gradually',
      ],
      recommendation: 'Add ₹2-3L over next 4-6 months. Target allocation: 8% of portfolio.',
      actionRequired: false,
    },
    {
      id: 'polycab-hold',
      type: 'HOLD',
      title: 'Polycab: Premium Justified, Hold',
      description: 'Excellent performer. Current valuation reflects quality.',
      confidence: 0.92,
      reasoning: [
        'PE = 54 vs historical avg 36 — but growth justifies premium',
        'Revenue CAGR 25%+ over 5 years',
        'Market leader in wires & cables',
        'No reason to exit before ₹12,500 target',
      ],
      recommendation: 'Continue holding. Do not add at current valuations. Exit target: ₹12,500.',
      actionRequired: false,
    },
    {
      id: 'prince-pipes-exit',
      type: 'SELL_ALERT',
      title: 'Prince Pipes: Exit Decision Required',
      description: 'Down 62% from cost. Competitive pressure increasing.',
      confidence: 0.85,
      reasoning: [
        'Market share loss to HDPE & PVC alternatives',
        'Debt increased by 40% YoY',
        'Earnings falling for 2 consecutive quarters',
        'Valuation unlikely to recover soon',
      ],
      recommendation:
        'Reduce by 75% immediately. Exit on any 10-15% bounce.',
      actionRequired: true,
    },
    {
      id: 'icici-rebalance',
      type: 'REBALANCE',
      title: 'ICICI Bank: Overweight — Reduce Position',
      description: 'Now 14% of portfolio (target: 10%). Consider trimming.',
      confidence: 0.82,
      reasoning: [
        'Strong performer driving portfolio weight',
        'Valuation premium to peers (PE 22 vs HDFB 20)',
        'Concentration risk increasing',
        'Better to deploy proceeds into underweight areas',
      ],
      recommendation:
        'Reduce 25% of holding. Redeploy to L&T and quality MF schemes.',
      actionRequired: false,
    },
  ];

  const handleAskAI = async (question: string) => {
    if (!question.trim()) return;

    const newChat = [...aiChat, { role: 'user', text: question }];
    setAiChat(newChat);
    setUserInput('');
    setLoading(true);

    try {
      // This would connect to your Claude API backend
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          context: {
            portfolio: {
              totalValue: 625000,
              totalInvested: 473000,
              holdings: 33,
            },
            recentInsights: insights,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiChat([...newChat, { role: 'assistant', text: data.response }]);
      }
    } catch (error) {
      console.error('AI Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      SELL_ALERT: 'border-l-red-500 bg-red-900/10',
      OPPORTUNITY: 'border-l-green-500 bg-green-900/10',
      HOLD: 'border-l-blue-500 bg-blue-900/10',
      REBALANCE: 'border-l-yellow-500 bg-yellow-900/10',
    };
    return colors[type] || 'border-l-blue-500 bg-blue-900/10';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      SELL_ALERT: '⚠️ Sell Alert',
      OPPORTUNITY: '🚀 Opportunity',
      HOLD: '✓ Hold',
      REBALANCE: '↔️ Rebalance',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* AI Chat */}
      <div className="glass-dark rounded-lg p-6 flex flex-col h-96">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-invest-accent" />
          Ask Your Wealth Manager
        </h3>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {aiChat.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm mb-2">
                Ask me anything about your portfolio
              </p>
              <p className="text-xs">
                "Should I buy Yes Bank?" • "Is my portfolio too risky?"
              </p>
            </div>
          ) : (
            aiChat.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
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
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-700 px-4 py-2 rounded-lg">
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAskAI(userInput)}
            placeholder="Ask about your portfolio..."
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-invest-accent"
            disabled={loading}
          />
          <button
            onClick={() => handleAskAI(userInput)}
            disabled={loading || !userInput.trim()}
            className="bg-invest-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            Send
          </button>
        </div>
      </div>

      {/* Insights List */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-invest-accent" />
          AI-Generated Insights
        </h3>
        <div className="space-y-4">
          {insights.map((insight) => (
            <button
              key={insight.id}
              onClick={() =>
                setSelectedInsight(
                  selectedInsight === insight.id ? null : insight.id
                )
              }
              className={`w-full text-left p-4 rounded-lg transition border-l-4 ${getTypeColor(
                insight.type
              )} card-hover`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{getTypeLabel(insight.type)}</span>
                    {insight.actionRequired && (
                      <span className="badge-danger">Action Required</span>
                    )}
                  </div>
                  <h4 className="font-semibold text-base mt-1">
                    {insight.title}
                  </h4>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Confidence</p>
                  <p className="font-bold text-sm">
                    {(insight.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-300 mb-3">
                {insight.description}
              </p>

              {selectedInsight === insight.id && (
                <div className="mt-4 pt-4 border-t border-slate-600 space-y-3 animate-slide-in-up">
                  <div>
                    <h5 className="text-xs font-semibold text-slate-300 mb-2">
                      REASONING
                    </h5>
                    <ul className="space-y-1">
                      {insight.reasoning.map((reason, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-slate-400 flex gap-2"
                        >
                          <span>•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-800/50 rounded p-3">
                    <h5 className="text-xs font-semibold text-green-400 mb-2">
                      RECOMMENDATION
                    </h5>
                    <p className="text-sm">{insight.recommendation}</p>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
