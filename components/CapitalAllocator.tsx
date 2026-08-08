'use client';

import React, { useState } from 'react';
import { Target, AlertCircle, CheckCircle } from 'lucide-react';

export default function CapitalAllocator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(25000);
  const [selectedMonth, setSelectedMonth] = useState('February 2026');

  // Sample allocation for February 2026
  const monthlyAllocations = {
    'February 2026': {
      date: 'February 2026',
      totalAmount: 25000,
      reasoning:
        'Focus on quality large-caps in accumulation zone. Reduce small-cap exposure gradually.',
      allocations: [
        {
          type: 'stock',
          name: 'L&T Limited',
          symbol: 'LT',
          amount: 10000,
          percentage: 40,
          reasoning:
            'PE = 22, near 5-year low. Strong order book. Conviction: HIGH',
          priority: 'high',
        },
        {
          type: 'mf',
          name: 'HDFC Flexicap Growth Direct',
          symbol: 'HDFC FC',
          amount: 7500,
          percentage: 30,
          reasoning:
            'Underweight in large-cap value. MF provides professional management.',
          priority: 'medium',
        },
        {
          type: 'mf',
          name: 'Parag Parikh Flexi Cap Growth',
          symbol: 'PP FC',
          amount: 5000,
          percentage: 20,
          reasoning: 'Maintain SIP continuity. Good expense ratio & performance.',
          priority: 'medium',
        },
        {
          type: 'cash',
          name: 'Cash Reserve',
          symbol: 'CASH',
          amount: 2500,
          percentage: 10,
          reasoning:
            'Wait for better opportunities. Market volatility expected.',
          priority: 'low',
        },
      ],
    },
    'March 2026': {
      date: 'March 2026',
      totalAmount: 25000,
      reasoning: 'Post-budget focus. Consider emerging opportunities.',
      allocations: [
        {
          type: 'stock',
          name: 'HDFC Bank',
          symbol: 'HDFCBANK',
          amount: 8000,
          percentage: 32,
          reasoning: 'Trading near support. Good dividend payer.',
          priority: 'high',
        },
        {
          type: 'stock',
          name: 'Polycab India',
          symbol: 'POLYCAB',
          amount: 5000,
          percentage: 20,
          reasoning: 'Quality stock. Buy on any weakness.',
          priority: 'medium',
        },
        {
          type: 'mf',
          name: 'Hybrid Fund',
          symbol: 'HYBRID',
          amount: 10000,
          percentage: 40,
          reasoning: 'Reduce volatility with balanced allocation.',
          priority: 'medium',
        },
        {
          type: 'cash',
          name: 'Cash Reserve',
          symbol: 'CASH',
          amount: 2000,
          percentage: 8,
          reasoning: 'Maintain dry powder for opportunities.',
          priority: 'low',
        },
      ],
    },
  };

  const allocation = monthlyAllocations[selectedMonth as keyof typeof monthlyAllocations] || monthlyAllocations['February 2026'];

  const totalAllocated = allocation.allocations.reduce((sum, a) => sum + a.amount, 0);

  const handleCustomInvestment = (value: number) => {
    setMonthlyInvestment(value);
  };

  return (
    <div className="space-y-6">
      {/* Investment Amount Input */}
      <div className="glass-dark rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-invest-accent" />
          Monthly Investment Plan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">
              Monthly Investable Amount
            </label>
            <div className="flex items-center gap-2">
              <span className="text-2xl">₹</span>
              <input
                type="number"
                value={monthlyInvestment}
                onChange={(e) =>
                  handleCustomInvestment(parseInt(e.target.value) || 0)
                }
                className="text-2xl font-bold bg-transparent border-b-2 border-invest-accent focus:outline-none w-32"
              />
              <span className="text-slate-400">/month</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Annual: ₹{(monthlyInvestment * 12).toLocaleString('en-IN')}
            </p>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">
              Your Annual Income (approx)
            </label>
            <p className="text-2xl font-bold">₹1.2 Cr</p>
            <p className="text-xs text-slate-400 mt-2">
              SIP Ratio: {((monthlyInvestment * 12 * 100) / 1200000).toFixed(1)}%
            </p>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">
              Time Horizon
            </label>
            <p className="text-2xl font-bold">20+ Yrs</p>
            <p className="text-xs text-slate-400 mt-2">Till age 60+</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[15000, 20000, 25000, 30000].map((amount) => (
            <button
              key={amount}
              onClick={() => handleCustomInvestment(amount)}
              className={`py-2 px-3 rounded text-sm font-medium transition ${
                monthlyInvestment === amount
                  ? 'bg-invest-accent text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              ₹{(amount / 1000).toFixed(0)}K
            </button>
          ))}
        </div>
      </div>

      {/* Month Selection */}
      <div className="glass-dark rounded-lg p-6">
        <h3 className="font-semibold mb-4">Select Month</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {['February 2026', 'March 2026'].map((month) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(month)}
              className={`py-2 px-3 rounded text-sm font-medium transition ${
                selectedMonth === month
                  ? 'bg-invest-accent text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {month}
            </button>
          ))}
        </div>
      </div>

      {/* Allocation Plan */}
      <div className="glass-dark rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{allocation.date} Allocation</h3>
          <p className="text-slate-400 text-sm">{allocation.reasoning}</p>
        </div>

        {/* Allocation Visualization */}
        <div className="mb-6">
          <div className="flex gap-2 h-8 rounded-lg overflow-hidden mb-2 bg-slate-700">
            {allocation.allocations.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-center text-xs font-medium text-white transition-all hover:opacity-80 cursor-help ${
                  item.type === 'stock'
                    ? 'bg-blue-600'
                    : item.type === 'mf'
                      ? 'bg-green-600'
                      : 'bg-slate-600'
                }`}
                style={{ width: `${item.percentage}%` }}
                title={item.name}
              >
                {item.percentage}%
              </div>
            ))}
          </div>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-600 rounded"></div>
              <span>Direct Stocks</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-600 rounded"></div>
              <span>Mutual Funds</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-slate-600 rounded"></div>
              <span>Cash</span>
            </div>
          </div>
        </div>

        {/* Allocation Details */}
        <div className="space-y-3">
          {allocation.allocations.map((item, idx) => (
            <div
              key={idx}
              className="border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.name}</p>
                    <span className="text-xs bg-slate-700 px-2 py-1 rounded">
                      {item.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{item.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    ₹{item.amount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-slate-400">{item.percentage}%</p>
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-2">{item.reasoning}</p>

              <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    item.priority === 'high'
                      ? 'bg-invest-accent'
                      : item.priority === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-slate-500'
                  }`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t border-slate-600">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Total Amount</p>
              <p className="text-xl font-bold">
                ₹{allocation.totalAmount.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Allocated</p>
              <p className="text-xl font-bold text-gain">
                ₹{totalAllocated.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Remaining</p>
              <p className="text-xl font-bold">
                ₹{(allocation.totalAmount - totalAllocated).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Implementation Guide */}
      <div className="glass-dark rounded-lg p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-gain" />
          Implementation Guide
        </h3>

        <div className="space-y-3">
          <div className="bg-slate-800/50 rounded p-4">
            <h4 className="font-medium mb-2">✓ Why L&T is top pick</h4>
            <ul className="text-sm text-slate-300 space-y-1 ml-4">
              <li>• PE 22 = 20% discount to 5-year average</li>
              <li>• Strong order book for next 3 years</li>
              <li>• Dividend yield 2.5% (stable)</li>
              <li>• Perfect for accumulation phase</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 rounded p-4">
            <h4 className="font-medium mb-2">✓ MF allocation rationale</h4>
            <ul className="text-sm text-slate-300 space-y-1 ml-4">
              <li>• Reduces stock-picking risk</li>
              <li>• Professional fund managers</li>
              <li>• Tax-efficient dividend harvest</li>
              <li>• Automatic rebalancing</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 rounded p-4">
            <h4 className="font-medium mb-2">⚠ Why 10% cash reserve?</h4>
            <ul className="text-sm text-slate-300 space-y-1 ml-4">
              <li>• Market volatility expected this quarter</li>
              <li>• Better opportunities may emerge</li>
              <li>• Psychological comfort for investors</li>
              <li>• Can deploy if sudden correction happens</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Next Actions */}
      <div className="glass-dark rounded-lg p-6 border-l-4 border-invest-accent">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-invest-accent" />
          Next Actions
        </h3>
        <ol className="space-y-2 text-sm">
          <li>
            <strong>This Week:</strong> Review and exit YES Bank (₹13,879 loss
            recovery?)
          </li>
          <li>
            <strong>Week 2:</strong> Reduce Prince Pipes by 75% at any 10-15%
            bounce
          </li>
          <li>
            <strong>Week 3:</strong> Start L&T SIP (₹2.5K/week for 4 weeks)
          </li>
          <li>
            <strong>Week 4:</strong> Deploy MF allocations for February closing
          </li>
        </ol>
      </div>
    </div>
  );
}
