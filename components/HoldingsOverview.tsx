'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';

export default function HoldingsOverview() {
  const [expandedCategory, setExpandedCategory] = useState('stocks');

  // Your stock holdings from the uploaded data
  const topStocks = [
    {
      symbol: 'POLYCAB',
      name: 'Polycab India Limited',
      owner: 'Manjiri',
      qty: 80,
      costPrice: 1886.55,
      currentPrice: 9010,
      value: 720800,
      gain: 569876,
      gainPct: 377.59,
    },
    {
      symbol: 'DIXTEC',
      name: 'Dixon Technologies India',
      owner: 'Pankaj',
      qty: 60,
      costPrice: 2965.88,
      currentPrice: 13810,
      value: 828600,
      gain: 650647,
      gainPct: 365.63,
    },
    {
      symbol: 'MARUTI',
      name: 'Maruti Suzuki India',
      owner: 'Pankaj',
      qty: 40,
      costPrice: 7674.35,
      currentPrice: 13730,
      value: 549200,
      gain: 242226,
      gainPct: 78.91,
    },
    {
      symbol: 'ICIBAN',
      name: 'ICICI Bank Limited',
      owner: 'Pankaj',
      qty: 192,
      costPrice: 94.38,
      currentPrice: 1445.7,
      value: 277574,
      gain: 259453,
      gainPct: 1431.79,
    },
    {
      symbol: 'HDFBAN',
      name: 'HDFC Bank Limited',
      owner: 'Pankaj',
      qty: 309,
      costPrice: 333.01,
      currentPrice: 739.55,
      value: 228521,
      gain: 125621,
      gainPct: 122.08,
    },
    {
      symbol: 'BAJFI',
      name: 'Bajaj Finance Limited',
      owner: 'Pankaj',
      qty: 500,
      costPrice: 416.9,
      currentPrice: 1048.3,
      value: 524150,
      gain: 315700,
      gainPct: 151.45,
    },
  ];

  const topMutualFunds = [
    {
      name: 'HDFC Flexicap Growth Direct',
      nav: 2232.42,
      units: 97.275,
      value: 217017,
      invested: 199990,
      gain: 17027,
      gainPct: 8.51,
    },
    {
      name: 'Parag Parikh Flexi Cap Growth',
      nav: 89.78,
      units: 2818.209,
      value: 253218,
      invested: 249988,
      gain: 3230,
      gainPct: 1.29,
    },
    {
      name: 'Baroda BNP Paribas Small Cap',
      nav: null,
      units: null,
      value: 413184,
      invested: 299985,
      gain: 113199,
      gainPct: 37.75,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stocks Section */}
      <div className="glass-dark rounded-lg overflow-hidden">
        <button
          onClick={() =>
            setExpandedCategory(expandedCategory === 'stocks' ? '' : 'stocks')
          }
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/50 transition"
        >
          <div>
            <h3 className="text-lg font-semibold">Direct Stock Holdings</h3>
            <p className="text-sm text-slate-400">
              30 stocks | Portfolio value: ₹40.5 Lakh
            </p>
          </div>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              expandedCategory === 'stocks' ? 'rotate-180' : ''
            }`}
          />
        </button>

        {expandedCategory === 'stocks' && (
          <div className="border-t border-slate-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800/50">
                  <th className="px-6 py-3 text-left font-medium">Symbol</th>
                  <th className="px-6 py-3 text-left font-medium">Owner</th>
                  <th className="px-6 py-3 text-right font-medium">Qty</th>
                  <th className="px-6 py-3 text-right font-medium">Cost Price</th>
                  <th className="px-6 py-3 text-right font-medium">Current</th>
                  <th className="px-6 py-3 text-right font-medium">Value</th>
                  <th className="px-6 py-3 text-right font-medium">Gain/Loss</th>
                  <th className="px-6 py-3 text-right font-medium">%</th>
                </tr>
              </thead>
              <tbody>
                {topStocks.map((stock, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-700 hover:bg-slate-800/50 transition"
                  >
                    <td className="px-6 py-4 font-medium">{stock.symbol}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{stock.owner}</td>
                    <td className="px-6 py-4 text-right">{stock.qty}</td>
                    <td className="px-6 py-4 text-right text-slate-400">
                      ₹{stock.costPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      ₹{stock.currentPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      ₹{stock.value.toLocaleString('en-IN')}
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-medium flex items-center justify-end gap-1 ${
                        stock.gain >= 0 ? 'text-gain' : 'text-loss'
                      }`}
                    >
                      {stock.gain >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      ₹{stock.gain.toLocaleString('en-IN')}
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-medium ${
                        stock.gainPct >= 0 ? 'text-gain' : 'text-loss'
                      }`}
                    >
                      {stock.gainPct >= 0 ? '+' : ''}{stock.gainPct.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mutual Funds Section */}
      <div className="glass-dark rounded-lg overflow-hidden">
        <button
          onClick={() =>
            setExpandedCategory(expandedCategory === 'mf' ? '' : 'mf')
          }
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/50 transition"
        >
          <div>
            <h3 className="text-lg font-semibold">Mutual Fund Holdings</h3>
            <p className="text-sm text-slate-400">
              3 schemes | Portfolio value: ₹8.8 Lakh
            </p>
          </div>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              expandedCategory === 'mf' ? 'rotate-180' : ''
            }`}
          />
        </button>

        {expandedCategory === 'mf' && (
          <div className="border-t border-slate-700 space-y-4 p-6">
            {topMutualFunds.map((fund, idx) => (
              <div
                key={idx}
                className="border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{fund.name}</h4>
                    {fund.units && (
                      <p className="text-xs text-slate-400 mt-1">
                        Units: {fund.units.toFixed(3)} | NAV: ₹{fund.nav?.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      ₹{fund.value.toLocaleString('en-IN')}
                    </p>
                    <p className={`text-xs font-medium ${fund.gainPct >= 0 ? 'text-gain' : 'text-loss'}`}>
                      {fund.gainPct >= 0 ? '+' : ''}{fund.gainPct.toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Invested</p>
                    <p className="font-medium">₹{fund.invested.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Current Value</p>
                    <p className="font-medium">₹{fund.value.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Gain/Loss</p>
                    <p className={`font-medium ${fund.gain >= 0 ? 'text-gain' : 'text-loss'}`}>
                      {fund.gain >= 0 ? '+' : ''}₹{fund.gain.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Holdings Analysis */}
      <div className="glass-dark rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Top 3 Holdings by Value</h3>
        <div className="space-y-4">
          <HoldingBarChart
            title="DIXON (Direct)"
            value={828600}
            percentage={12.8}
            status="high"
          />
          <HoldingBarChart
            title="POLYCAB (Direct)"
            value={720800}
            percentage={11.1}
            status="high"
          />
          <HoldingBarChart
            title="MARUTI (Direct)"
            value={549200}
            percentage={8.4}
            status="medium"
          />
        </div>
      </div>
    </div>
  );
}

function HoldingBarChart({
  title,
  value,
  percentage,
  status,
}: {
  title: string;
  value: number;
  percentage: number;
  status: 'high' | 'medium' | 'low';
}) {
  const statusColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">{title}</span>
        <span className="text-sm text-slate-400">
          ₹{value.toLocaleString('en-IN')} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${statusColors[status]} transition-all`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}
