'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import { Upload, PlusCircle, Loader2, CheckCircle2 } from 'lucide-react';
import {
  bulkAddStockHoldings,
  addStockHolding,
  NewStockHoldingInput,
} from '@/lib/portfolio';

interface Props {
  familyMemberId: number;
  onComplete: () => void;
}

/**
 * CSV columns expected (header row required, case-insensitive):
 * symbol, company_name, quantity, avg_cost_price, current_price
 *
 * This matches a simple export you can create from any broker statement -
 * see the sample template link in the UI.
 */
export default function PortfolioOnboarding({ familyMemberId, onComplete }: Props) {
  const [mode, setMode] = useState<'choose' | 'upload' | 'manual'>('choose');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<number | null>(null);

  // Manual entry form state
  const [form, setForm] = useState({
    symbol: '',
    company_name: '',
    quantity: '',
    avg_cost_price: '',
    current_price: '',
  });
  const [savingManual, setSavingManual] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data as Record<string, string>[];
          const normalized: NewStockHoldingInput[] = rows
            .map((row) => {
              // Normalize header casing (Symbol, SYMBOL, symbol, etc.)
              const get = (key: string) => {
                const found = Object.keys(row).find(
                  (k) => k.trim().toLowerCase() === key
                );
                return found ? row[found] : undefined;
              };

              const symbol = get('symbol');
              const company_name = get('company_name') || get('name') || symbol;
              const quantity = parseFloat(get('quantity') || '0');
              const avg_cost_price = parseFloat(get('avg_cost_price') || get('cost_price') || '0');
              const current_price = parseFloat(get('current_price') || avg_cost_price?.toString() || '0');

              if (!symbol || !quantity) return null;

              return {
                family_member_id: familyMemberId,
                symbol: symbol.toUpperCase(),
                company_name: company_name || symbol,
                quantity,
                avg_cost_price: avg_cost_price || 0,
                current_price: current_price || avg_cost_price || 0,
              } as NewStockHoldingInput;
            })
            .filter((r): r is NewStockHoldingInput => r !== null);

          if (normalized.length === 0) {
            throw new Error(
              'No valid rows found. Make sure your CSV has symbol, quantity, avg_cost_price columns.'
            );
          }

          await bulkAddStockHoldings(normalized);
          setUploadSuccess(normalized.length);
          setTimeout(() => onComplete(), 1200);
        } catch (err: any) {
          setUploadError(err.message || 'Failed to parse or save CSV');
        } finally {
          setUploading(false);
        }
      },
      error: (err) => {
        setUploadError(err.message);
        setUploading(false);
      },
    });
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);
    setSavingManual(true);

    try {
      const quantity = parseFloat(form.quantity);
      const avg_cost_price = parseFloat(form.avg_cost_price);
      const current_price = parseFloat(form.current_price || form.avg_cost_price);

      if (!form.symbol || !quantity || !avg_cost_price) {
        throw new Error('Symbol, quantity, and average cost price are required.');
      }

      await addStockHolding({
        family_member_id: familyMemberId,
        symbol: form.symbol.toUpperCase(),
        company_name: form.company_name || form.symbol,
        quantity,
        avg_cost_price,
        current_price: current_price || avg_cost_price,
      });

      setForm({
        symbol: '',
        company_name: '',
        quantity: '',
        avg_cost_price: '',
        current_price: '',
      });
      onComplete();
    } catch (err: any) {
      setManualError(err.message || 'Failed to save holding');
    } finally {
      setSavingManual(false);
    }
  };

  if (mode === 'choose') {
    return (
      <div className="glass-dark rounded-lg p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">No holdings yet</h2>
        <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
          Add your portfolio to get a health score, AI insights, and
          personalized recommendations. Nothing is pre-filled — this account
          starts blank.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setMode('upload')}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload CSV
          </button>
          <button
            onClick={() => setMode('manual')}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Add Manually
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'upload') {
    return (
      <div className="glass-dark rounded-lg p-8">
        <button
          onClick={() => setMode('choose')}
          className="text-xs text-slate-400 mb-4 hover:text-white"
        >
          ← Back
        </button>
        <h2 className="text-lg font-semibold mb-2">Upload holdings CSV</h2>
        <p className="text-sm text-slate-400 mb-4">
          Required columns (header row, any order):{' '}
          <code className="text-invest-accent">
            symbol, company_name, quantity, avg_cost_price, current_price
          </code>
        </p>

        <label className="block border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-invest-accent transition">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-invest-accent" />
          ) : (
            <Upload className="w-8 h-8 mx-auto text-slate-500 mb-2" />
          )}
          <p className="text-sm text-slate-400 mt-2">
            {uploading ? 'Processing...' : 'Click to select a .csv file'}
          </p>
        </label>

        {uploadError && (
          <p className="text-sm text-loss bg-red-900/20 border border-red-800 rounded p-3 mt-4">
            {uploadError}
          </p>
        )}
        {uploadSuccess !== null && (
          <p className="text-sm text-gain bg-green-900/20 border border-green-800 rounded p-3 mt-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Added {uploadSuccess} holdings. Refreshing dashboard...
          </p>
        )}
      </div>
    );
  }

  // Manual entry
  return (
    <div className="glass-dark rounded-lg p-8">
      <button
        onClick={() => setMode('choose')}
        className="text-xs text-slate-400 mb-4 hover:text-white"
      >
        ← Back
      </button>
      <h2 className="text-lg font-semibold mb-4">Add a holding manually</h2>

      <form onSubmit={handleManualSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Symbol *</label>
          <input
            value={form.symbol}
            onChange={(e) => setForm({ ...form, symbol: e.target.value })}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-invest-accent"
            placeholder="LT"
            required
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Company Name</label>
          <input
            value={form.company_name}
            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-invest-accent"
            placeholder="Larsen & Toubro Ltd"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Quantity *</label>
          <input
            type="number"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-invest-accent"
            required
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Avg Cost Price (₹) *</label>
          <input
            type="number"
            step="0.01"
            value={form.avg_cost_price}
            onChange={(e) => setForm({ ...form, avg_cost_price: e.target.value })}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-invest-accent"
            required
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Current Price (₹)</label>
          <input
            type="number"
            step="0.01"
            value={form.current_price}
            onChange={(e) => setForm({ ...form, current_price: e.target.value })}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-invest-accent"
            placeholder="Defaults to cost price"
          />
        </div>

        {manualError && (
          <p className="text-sm text-loss bg-red-900/20 border border-red-800 rounded p-2 sm:col-span-2">
            {manualError}
          </p>
        )}

        <button
          type="submit"
          disabled={savingManual}
          className="btn-primary sm:col-span-2 flex items-center justify-center gap-2"
        >
          {savingManual && <Loader2 className="w-4 h-4 animate-spin" />}
          Add Holding
        </button>
      </form>
    </div>
  );
}
