'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, Trash2 } from 'lucide-react';
import { usePortfolioData } from '@/lib/usePortfolioData';
import { deleteStockHolding, deleteMFHolding } from '@/lib/portfolio';
import PortfolioOnboarding from './PortfolioOnboarding';

export default function HoldingsOverview() {
  const { familyMemberId, stocks, mfs, summary, loading, isEmpty, refresh } =
    usePortfolioData();
  const [expandedCategory, setExpandedCategory] = useState('stocks');

  if (loading) {
    return (
      <div className="glass-dark rounded-lg p-8 text-center text-slate-400 text-sm">
        Loading your holdings...
      </div>
    );
  }

  if (isEmpty && familyMemberId) {
    return (
      <PortfolioOnboarding familyMemberId={familyMemberId} onComplete={refresh} />
    );
  }

  const totalStockValue = stocks.reduce((s, x) => s + (x.value_at_market || 0), 0);
  const totalMFValue = mfs.reduce((s, x) => s + (x.current_value || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stocks Section */}
      {stocks.length > 0 && (
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
                {stocks.length} stocks | Portfolio value: ₹
                {totalStockValue.toLocaleString('en-IN')}
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
                    <th className="px-6 py-3 text-right font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock) => (
                    <tr
                      key={stock.id}
                      className="border-b border-slate-700 hover:bg-slate-800/50 transition"
                    >
                      <td className="px-6 py-4 font-medium">{stock.symbol}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {stock.owner_name || '—'}
                      </td>
                      <td className="px-6 py-4 text-right">{stock.quantity}</td>
                      <td className="px-6 py-4 text-right text-slate-400">
                        ₹{stock.avg_cost_price?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        ₹{stock.current_price?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">
                        ₹{stock.value_at_market?.toLocaleString('en-IN')}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-medium flex items-center justify-end gap-1 ${
                          stock.unrealized_gain_loss >= 0 ? 'text-gain' : 'text-loss'
                        }`}
                      >
                        {stock.unrealized_gain_loss >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        ₹{stock.unrealized_gain_loss?.toLocaleString('en-IN')}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-medium ${
                          stock.unrealized_gain_loss_pct >= 0 ? 'text-gain' : 'text-loss'
                        }`}
                      >
                        {stock.unrealized_gain_loss_pct >= 0 ? '+' : ''}
                        {stock.unrealized_gain_loss_pct?.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={async () => {
                            if (confirm(`Remove ${stock.symbol}?`)) {
                              await deleteStockHolding(stock.id);
                              refresh();
                            }
                          }}
                          className="text-slate-500 hover:text-loss transition"
                          title="Remove holding"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Mutual Funds Section */}
      {mfs.length > 0 && (
        <div className="glass-dark rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedCategory(expandedCategory === 'mf' ? '' : 'mf')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/50 transition"
          >
            <div>
              <h3 className="text-lg font-semibold">Mutual Fund Holdings</h3>
              <p className="text-sm text-slate-400">
                {mfs.length} schemes | Portfolio value: ₹
                {totalMFValue.toLocaleString('en-IN')}
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
              {mfs.map((fund) => {
                const gain = (fund.current_value || 0) - (fund.cost_value || 0);
                const gainPct =
                  fund.cost_value > 0 ? (gain / fund.cost_value) * 100 : 0;
                return (
                  <div
                    key={fund.id}
                    className="border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{fund.fund_name}</h4>
                        {fund.units && (
                          <p className="text-xs text-slate-400 mt-1">
                            Units: {fund.units.toFixed(3)}
                            {fund.current_nav ? ` | NAV: ₹${fund.current_nav.toFixed(2)}` : ''}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex items-start gap-3">
                        <div>
                          <p className="font-semibold text-lg">
                            ₹{fund.current_value?.toLocaleString('en-IN')}
                          </p>
                          <p className={`text-xs font-medium ${gainPct >= 0 ? 'text-gain' : 'text-loss'}`}>
                            {gainPct >= 0 ? '+' : ''}{gainPct.toFixed(2)}%
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            if (confirm(`Remove ${fund.fund_name}?`)) {
                              await deleteMFHolding(fund.id);
                              refresh();
                            }
                          }}
                          className="text-slate-500 hover:text-loss transition mt-1"
                          title="Remove holding"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Invested</p>
                        <p className="font-medium">₹{fund.cost_value?.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Current Value</p>
                        <p className="font-medium">₹{fund.current_value?.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Gain/Loss</p>
                        <p className={`font-medium ${gain >= 0 ? 'text-gain' : 'text-loss'}`}>
                          {gain >= 0 ? '+' : ''}₹{gain.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Top Holdings — computed dynamically from real data, not a fixed list,
          so nothing can be silently missing (e.g. a stock like L&T). */}
      {summary.topHoldings.length > 0 && (
        <div className="glass-dark rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            Top {summary.topHoldings.length} Holdings by Value
          </h3>
          <div className="space-y-4">
            {summary.topHoldings.map((holding) => {
              const percentage =
                summary.totalValue > 0
                  ? (holding.value_at_market / summary.totalValue) * 100
                  : 0;
              return (
                <HoldingBarChart
                  key={holding.id}
                  title={`${holding.symbol} (${holding.owner_name || 'Direct'})`}
                  value={holding.value_at_market}
                  percentage={percentage}
                  status={percentage > 10 ? 'high' : percentage > 5 ? 'medium' : 'low'}
                />
              );
            })}
          </div>
        </div>
      )}
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
