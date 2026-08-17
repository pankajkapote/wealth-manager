'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import PortfolioManager from '@/components/PortfolioManager';
import { usePortfolioData } from '@/lib/usePortfolioData';
import {
  deleteStockHolding,
  deleteMFHolding,
} from '@/lib/portfolio';

export default function HoldingsOverview() {
  const { stocks, mfs, refetch, loading } = usePortfolioData();
  const [showManager, setShowManager] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (id: number, type: 'stock' | 'mf') => {
    if (!confirm('Are you sure? This cannot be undone.')) return;

    setDeleting(id);
    try {
      if (type === 'stock') {
        await deleteStockHolding(id);
      } else {
        await deleteMFHolding(id);
      }
      await refetch();
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  if (showManager) {
    return (
      <PortfolioManager
        familyMemberId={1}
        stocks={stocks}
        mfs={mfs}
        onComplete={() => {
          setShowManager(false);
          refetch();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-invest-accent mb-2" />
        <p className="text-slate-400">Loading holdings...</p>
      </div>
    );
  }

  const isEmpty = stocks.length === 0 && mfs.length === 0;

  return (
    <div className="space-y-6">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Your Holdings</h2>
          <p className="text-sm text-slate-400 mt-1">
            {stocks.length + mfs.length} total holdings
          </p>
        </div>
        <button
          onClick={() => setShowManager(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add or Upload
        </button>
      </div>

      {isEmpty ? (
        <div className="glass-dark rounded-lg p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-full mb-4">
            <TrendingUp className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No holdings yet</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Get started by adding your stocks and mutual funds. You can upload a
            CSV from your broker or Kuvera, or add them manually.
          </p>
          <button
            onClick={() => setShowManager(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Your First Holding
          </button>
        </div>
      ) : (
        <>
          {/* Stocks Section */}
          {stocks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Stocks ({stocks.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {stocks.map((stock) => (
                  <div
                    key={`stock-${stock.id}`}
                    className="glass-dark rounded-lg p-4 flex items-center justify-between hover:bg-slate-800/50 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg">{stock.symbol}</span>
                        <span className="text-xs text-slate-400">
                          {stock.company_name}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-slate-400">
                        <span>
                          {stock.quantity} × ₹{stock.current_price.toFixed(2)}
                        </span>
                        <span>Cost: ₹{stock.value_at_cost.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="text-right mr-4">
                      <p className="text-lg font-semibold">
                        ₹{stock.value_at_market.toLocaleString('en-IN')}
                      </p>
                      <p
                        className={`text-sm font-medium flex items-center justify-end gap-1 ${
                          stock.gain_loss >= 0 ? 'text-gain' : 'text-loss'
                        }`}
                      >
                        {stock.gain_loss >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {stock.gain_loss >= 0 ? '+' : ''}
                        {stock.gain_loss_percent.toFixed(1)}%
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(stock.id, 'stock')}
                      disabled={deleting === stock.id}
                      className="text-slate-500 hover:text-loss transition disabled:opacity-50 p-2"
                    >
                      {deleting === stock.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mutual Funds Section */}
          {mfs.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Mutual Funds ({mfs.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {mfs.map((fund) => (
                  <div
                    key={`mf-${fund.id}`}
                    className="glass-dark rounded-lg p-4 flex items-center justify-between hover:bg-slate-800/50 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">{fund.fund_name}</span>
                      </div>
                      <div className="flex gap-4 text-xs text-slate-400">
                        {fund.units && (
                          <span>
                            {fund.units.toFixed(3)} units @ ₹
                            {(fund.current_nav || 0).toFixed(2)}
                          </span>
                        )}
                        <span>
                          Invested: ₹{fund.cost_value.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right mr-4">
                      <p className="text-lg font-semibold">
                        ₹{fund.current_value.toLocaleString('en-IN')}
                      </p>
                      <p
                        className={`text-sm font-medium flex items-center justify-end gap-1 ${
                          fund.gain_loss >= 0 ? 'text-gain' : 'text-loss'
                        }`}
                      >
                        {fund.gain_loss >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {fund.gain_loss >= 0 ? '+' : ''}
                        {fund.gain_loss_percent.toFixed(1)}%
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(fund.id, 'mf')}
                      disabled={deleting === fund.id}
                      className="text-slate-500 hover:text-loss transition disabled:opacity-50 p-2"
                    >
                      {deleting === fund.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
