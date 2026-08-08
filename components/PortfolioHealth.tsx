'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CheckCircle } from 'lucide-react';
import { usePortfolioData } from '@/lib/usePortfolioData';
import PortfolioOnboarding from './PortfolioOnboarding';

const CHART_COLORS = ['#1e40af', '#0f172a', '#475569', '#3b82f6', '#64748b'];

export default function PortfolioHealth() {
  const { familyMemberId, stocks, mfs, summary, loading, isEmpty, refresh } =
    usePortfolioData();

  if (loading) {
    return (
      <div className="glass-dark rounded-lg p-8 text-center text-slate-400 text-sm">
        Calculating portfolio health...
      </div>
    );
  }

  if (isEmpty && familyMemberId) {
    return (
      <PortfolioOnboarding familyMemberId={familyMemberId} onComplete={refresh} />
    );
  }

  // Concentration: what % of the portfolio is the single largest holding,
  // and what % is the top 5 combined. This is computed from real data,
  // not asserted.
  const topHolding = summary.topHoldings[0];
  const topHoldingPct =
    summary.totalValue > 0 && topHolding
      ? (topHolding.value_at_market / summary.totalValue) * 100
      : 0;
  const top5Value = summary.topHoldings.reduce(
    (s, h) => s + (h.value_at_market || 0),
    0
  );
  const top5Pct = summary.totalValue > 0 ? (top5Value / summary.totalValue) * 100 : 0;

  // Simple, transparent scoring - not dressed up as more precise than it is.
  const concentrationScore = Math.max(0, 10 - Math.max(0, top5Pct - 40) / 6);
  const diversificationScore = Math.min(10, summary.holdingsCount / 3);
  const overallScore = (concentrationScore + diversificationScore) / 2;

  const assetAllocation = [
    { name: 'Direct Stocks', value: summary.totalValue - (summary.mfCount > 0 ? mfs.reduce((s, m) => s + (m.current_value || 0), 0) : 0) },
    { name: 'Mutual Funds', value: mfs.reduce((s, m) => s + (m.current_value || 0), 0) },
  ].filter((a) => a.value > 0);

  return (
    <div className="space-y-6">
      {/* Main Health Score */}
      <div className="glass-dark rounded-lg p-6 card-hover">
        <h2 className="text-2xl font-bold mb-6">Portfolio Health Score</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="rgba(100, 116, 139, 0.2)"
                  strokeWidth="4"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="#1e40af"
                  strokeWidth="4"
                  strokeDasharray={`${(overallScore / 10) * 2 * Math.PI * 90} ${2 * Math.PI * 90}`}
                  strokeLinecap="round"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-4xl font-bold">{overallScore.toFixed(1)}</p>
                <p className="text-sm text-slate-400">/10</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Total Portfolio Value</p>
              <p className="text-2xl font-bold">
                ₹{summary.totalValue.toLocaleString('en-IN')}
              </p>
              <p className={`text-xs mt-1 ${summary.gainPercentage >= 0 ? 'text-gain' : 'text-loss'}`}>
                {summary.gainPercentage >= 0 ? '+' : ''}
                {summary.gainPercentage.toFixed(1)}% overall
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Total Invested</p>
              <p className="text-2xl font-bold">
                ₹{summary.totalInvested.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Unrealized Gains</p>
              <p className={`text-2xl font-bold ${summary.totalGains >= 0 ? 'text-gain' : 'text-loss'}`}>
                ₹{summary.totalGains.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Holdings Count</p>
              <p className="text-2xl font-bold">{summary.holdingsCount}</p>
              <p className="text-xs text-slate-400 mt-1">
                {summary.stockCount} stocks + {summary.mfCount} MF schemes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Allocation */}
      {assetAllocation.length > 0 && (
        <div className="glass-dark rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Asset Class Allocation</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={assetAllocation}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {assetAllocation.map((entry, index) => (
                  <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(30, 64, 175, 0.3)',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Concentration Detail */}
      <div className="glass-dark rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Concentration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-slate-600 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">Largest single holding</p>
            <p className="text-xl font-bold">
              {topHolding ? `${topHolding.symbol} — ${topHoldingPct.toFixed(1)}%` : '—'}
            </p>
          </div>
          <div className="border border-slate-600 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">Top 5 holdings combined</p>
            <p className="text-xl font-bold">{top5Pct.toFixed(1)}% of portfolio</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          As a rough guide, many long-term investors keep top-5 concentration
          under 40-50% unless deliberately running a high-conviction
          portfolio. This isn't a rule — just context for the number above.
        </p>
      </div>

      <div className="glass-dark rounded-lg p-6 border-l-4 border-invest-accent">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-gain" />
          What this score does (and doesn't) cover
        </h3>
        <p className="text-sm text-slate-400">
          This score reflects diversification and concentration based on your
          actual holdings. It does not yet factor in valuation (P/E), sector
          exposure, or debt levels — those require market data this app
          doesn't currently fetch. Use it as one input, not a verdict.
        </p>
      </div>
    </div>
  );
}
