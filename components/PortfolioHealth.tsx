'use client';

import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export default function PortfolioHealth() {
  const healthScore = 8.2;
  const maxScore = 10;

  // Sample data based on your portfolio
  const sectorAllocation = [
    { name: 'Banking & Finance', value: 35, color: '#3b82f6' },
    { name: 'Industrial & Engineering', value: 28, color: '#10b981' },
    { name: 'Consumer & Retail', value: 18, color: '#f59e0b' },
    { name: 'Technology & IT', value: 14, color: '#8b5cf6' },
    { name: 'Energy & Utilities', value: 5, color: '#ef4444' },
  ];

  const assetAllocation = [
    { name: 'Equities (Direct)', value: 65, color: '#0f172a' },
    { name: 'Mutual Funds', value: 25, color: '#1e40af' },
    { name: 'Other Assets', value: 10, color: '#475569' },
  ];

  const healthMetrics = [
    {
      label: 'Concentration Risk',
      score: 7.5,
      status: 'good',
      description: 'Top 5 holdings = 45% of portfolio. Acceptable for growth investor.',
    },
    {
      label: 'Diversification',
      score: 8.0,
      status: 'excellent',
      description: 'Well diversified across 30+ stocks and 3 MF schemes.',
    },
    {
      label: 'Valuation Health',
      score: 7.8,
      status: 'good',
      description: 'Portfolio PE = 42 vs market 22. Growth premium justified.',
    },
    {
      label: 'Debt Health',
      score: 9.0,
      status: 'excellent',
      description: 'No debt investments. Equity-only strategy.',
    },
    {
      label: 'Income Stability',
      score: 8.5,
      status: 'excellent',
      description: 'Good mix of dividend & growth stocks.',
    },
    {
      label: 'Risk Adjustment',
      score: 8.1,
      status: 'good',
      description: 'Moderate risk profile. Aligned with 20+ year horizon.',
    },
  ];

  const healthGrade = healthScore >= 8 ? 'Excellent' : healthScore >= 7 ? 'Good' : 'Fair';

  return (
    <div className="space-y-6">
      {/* Main Health Score */}
      <div className="glass-dark rounded-lg p-6 card-hover">
        <h2 className="text-2xl font-bold mb-6">Portfolio Health Score</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Score Circle */}
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full" viewBox="0 0 200 200">
                {/* Background circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="rgba(100, 116, 139, 0.2)"
                  strokeWidth="4"
                />
                {/* Progress circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="#1e40af"
                  strokeWidth="4"
                  strokeDasharray={`${(healthScore / maxScore) * 2 * Math.PI * 90} ${2 * Math.PI * 90}`}
                  strokeLinecap="round"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-4xl font-bold">{healthScore}</p>
                <p className="text-sm text-slate-400">/10</p>
                <p className="text-xs font-medium text-invest-accent mt-2">{healthGrade}</p>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Total Portfolio Value</p>
              <p className="text-2xl font-bold">₹62.5 Lakh</p>
              <p className="text-xs text-gain mt-1">+12.3% YTD</p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Total Invested</p>
              <p className="text-2xl font-bold">₹47.3 Lakh</p>
              <p className="text-xs text-gain mt-1">Realized gains: ₹2.1 Lakh</p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Unrealized Gains</p>
              <p className="text-2xl font-bold">₹15.2 Lakh</p>
              <p className="text-xs text-gain mt-1">+32.2% on invested amount</p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Holdings Count</p>
              <p className="text-2xl font-bold">33</p>
              <p className="text-xs text-slate-400 mt-1">30 stocks + 3 MF schemes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Allocation Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sector Allocation */}
        <div className="glass-dark rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Sector Allocation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sectorAllocation}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {sectorAllocation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `${value}%`}
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(30, 64, 175, 0.3)',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {sectorAllocation.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Asset Allocation */}
        <div className="glass-dark rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Asset Class Allocation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={assetAllocation}>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(30, 64, 175, 0.3)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {assetAllocation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {assetAllocation.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="glass-dark rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-6">Health Metrics Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthMetrics.map((metric, index) => (
            <div
              key={index}
              className="border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-sm">{metric.label}</h4>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold">{metric.score}</span>
                  <span className="text-xs text-slate-400">/10</span>
                </div>
              </div>

              {/* Score bar */}
              <div className="h-1.5 bg-slate-700 rounded-full mb-3 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    metric.status === 'excellent' ? 'bg-gain' : 'bg-invest-accent'
                  }`}
                  style={{ width: `${(metric.score / 10) * 100}%` }}
                ></div>
              </div>

              <p className="text-xs text-slate-400">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass-dark rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-gain" />
          Strengths & Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
            <h4 className="font-medium text-green-200 mb-2">✓ Strengths</h4>
            <ul className="space-y-1 text-sm text-slate-300">
              <li>• Well-balanced portfolio across sectors</li>
              <li>• Strong performance in quality stocks (Polycab, Dixon, L&T)</li>
              <li>• Good inclusion of MF for diversification</li>
              <li>• Healthy unrealized gains (+32%)</li>
            </ul>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
            <h4 className="font-medium text-yellow-200 mb-2">⚠ Areas to Monitor</h4>
            <ul className="space-y-1 text-sm text-slate-300">
              <li>• Exit YES Bank loss position (down 92%)</li>
              <li>• Review Prince Pipes holding (-62%)</li>
              <li>• ICICI Bank becoming overweight (14%)</li>
              <li>• Consider small-cap exposure reduction</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
