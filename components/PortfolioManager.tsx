'use client';

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import {
  Upload,
  PlusCircle,
  Loader2,
  CheckCircle2,
  Download,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';
import {
  bulkAddStockHoldings,
  bulkAddMFHoldings,
  addStockHolding,
  addMFHolding,
  NewStockHoldingInput,
  NewMFHoldingInput,
} from '@/lib/portfolio';

interface PortfolioManagerProps {
  familyMemberId: number;
  stocks: any[];
  mfs: any[];
  onComplete: () => void;
}

type ViewMode = 'choose' | 'upload' | 'manual' | 'edit-holdings';

/**
 * Portfolio upload manager supporting:
 * - CSV files (stocks or MF)
 * - XLS files (which are actually HTML tables from Excel export)
 * - Manual single-entry form
 * - Edit existing holdings (inline)
 * - Delete with confirmation
 */
export default function PortfolioManager({
  familyMemberId,
  stocks,
  mfs,
  onComplete,
}: PortfolioManagerProps) {
  const [mode, setMode] = useState<ViewMode>('choose');
  const [uploadType, setUploadType] = useState<'stocks' | 'mf' | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<number | null>(null);

  // Manual entry form
  const [form, setForm] = useState({
    type: 'stock' as 'stock' | 'mf',
    symbol: '',
    company_name: '',
    quantity: '',
    avg_cost_price: '',
    current_price: '',
    fund_name: '',
    units: '',
    nav: '',
    current_nav: '',
    cost_value: '',
    current_value: '',
  });
  const [savingManual, setSavingManual] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  // Edit mode
  const [editingStock, setEditingStock] = useState<any | null>(null);
  const [editingMF, setEditingMF] = useState<any | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = (type: 'stocks' | 'mf') => {
    const templateUrl = `/TEMPLATE-${type === 'stocks' ? 'STOCKS' : 'MUTUALFUNDS'}.csv`;
    const a = document.createElement('a');
    a.href = templateUrl;
    a.download = `portfolio-template-${type}.csv`;
    a.click();
  };

  // Parse both CSV and XLS (HTML table) formats
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const isXLS = file.name.endsWith('.xls') || file.name.endsWith('.xlsx');

    if (isXLS) {
      // XLS files from Excel are HTML tables
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const html = evt.target?.result as string;
          const rows = parseHTMLTable(html);
          await processUploadedRows(rows);
        } catch (err: any) {
          setUploadError(err.message || 'Failed to parse XLS file');
        } finally {
          setUploading(false);
        }
      };
      reader.onerror = () => {
        setUploadError('Failed to read file');
        setUploading(false);
      };
      reader.readAsText(file);
    } else {
      // CSV files
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            await processUploadedRows(results.data as Record<string, string>[]);
          } catch (err: any) {
            setUploadError(err.message || 'Failed to parse CSV');
          } finally {
            setUploading(false);
          }
        },
        error: (err) => {
          setUploadError(err.message);
          setUploading(false);
        },
      });
    }
  };

  const parseHTMLTable = (html: string): Record<string, string>[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const rows: Record<string, string>[] = [];

    const table = doc.querySelector('table');
    if (!table) throw new Error('No table found in XLS file');

    const headerRow = table.querySelector('tr');
    if (!headerRow) throw new Error('No header row found');

    const headers = Array.from(headerRow.querySelectorAll('th, td')).map((cell) =>
      cell.textContent?.trim().toLowerCase().replace(/\s+/g, '_') || ''
    );

    const tbody = table.querySelector('tbody') || table;
    tbody.querySelectorAll('tr').forEach((row, idx) => {
      if (idx === 0 && !table.querySelector('tbody')) return; // skip header if no tbody
      const cells = Array.from(row.querySelectorAll('td'));
      if (cells.length === 0) return;

      const rowData: Record<string, string> = {};
      headers.forEach((header, cellIdx) => {
        rowData[header] = cells[cellIdx]?.textContent?.trim() || '';
      });
      if (Object.values(rowData).some((v) => v)) rows.push(rowData);
    });

    return rows;
  };

  const processUploadedRows = async (rows: Record<string, string>[]) => {
    // Detect whether this is stocks or MF based on column names
    const isStockData = rows.some((row) =>
      Object.keys(row).some((k) => k.includes('symbol'))
    );
    const isMFData = rows.some((row) =>
      Object.keys(row).some((k) => k.includes('fund') || k.includes('units'))
    );

    if (!isStockData && !isMFData) {
      throw new Error(
        'Could not detect data type. Expected "symbol" column for stocks or "fund_name"/"units" for MF.'
      );
    }

    const normalized = rows
      .map((row) => {
        const get = (keys: string[]) => {
          const found = Object.keys(row).find((k) =>
            keys.some((key) => k.toLowerCase().includes(key))
          );
          return found ? row[found] : undefined;
        };

        if (isStockData && !isMFData) {
          const symbol = get(['symbol']);
          const company_name =
            get(['company', 'name']) || symbol;
          const quantity = parseFloat(get(['quantity', 'qty']) || '0');
          const avg_cost_price = parseFloat(
            get(['avg_cost', 'cost_price', 'average']) || '0'
          );
          const current_price = parseFloat(
            get(['current', 'price']) || avg_cost_price?.toString() || '0'
          );

          if (!symbol || !quantity) return null;

          return {
            family_member_id: familyMemberId,
            symbol: symbol.toUpperCase(),
            company_name: company_name || symbol,
            quantity,
            avg_cost_price: avg_cost_price || 0,
            current_price: current_price || avg_cost_price || 0,
          } as NewStockHoldingInput;
        } else if (isMFData) {
          const fund_name = get(['fund', 'name']);
          const units = parseFloat(get(['units']) || '0');
          const nav = parseFloat(get(['nav']) || '0');
          const current_nav =
            parseFloat(get(['current_nav', 'curr_nav']) || '0') || nav;
          const cost_value = parseFloat(get(['cost', 'cost_value', 'invested']) || '0');
          const current_value = parseFloat(get(['current', 'value', 'current_value']) || '0');

          if (!fund_name || (!cost_value && !current_value)) return null;

          return {
            family_member_id: familyMemberId,
            fund_name,
            units: units || undefined,
            nav: nav || undefined,
            current_nav: current_nav || undefined,
            cost_value,
            current_value,
          } as NewMFHoldingInput;
        }

        return null;
      })
      .filter((r): r is NewStockHoldingInput | NewMFHoldingInput => r !== null);

    if (normalized.length === 0) {
      throw new Error('No valid rows found in file');
    }

    // Split by type
    const stockRows = normalized.filter(
      (r): r is NewStockHoldingInput => 'symbol' in r
    );
    const mfRows = normalized.filter(
      (r): r is NewMFHoldingInput => 'fund_name' in r
    );

    if (stockRows.length > 0) {
      await bulkAddStockHoldings(stockRows);
    }
    if (mfRows.length > 0) {
      await bulkAddMFHoldings(mfRows);
    }

    setUploadSuccess(normalized.length);
    setTimeout(() => onComplete(), 1200);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);
    setSavingManual(true);

    try {
      if (form.type === 'stock') {
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
      } else {
        const cost_value = parseFloat(form.cost_value);
        const current_value = parseFloat(form.current_value);

        if (!form.fund_name || (!cost_value && !current_value)) {
          throw new Error('Fund name and at least one value (cost or current) required.');
        }

        await addMFHolding({
          family_member_id: familyMemberId,
          fund_name: form.fund_name,
          units: form.units ? parseFloat(form.units) : undefined,
          nav: form.nav ? parseFloat(form.nav) : undefined,
          current_nav: form.current_nav ? parseFloat(form.current_nav) : undefined,
          cost_value,
          current_value,
        });
      }

      setForm({
        type: 'stock',
        symbol: '',
        company_name: '',
        quantity: '',
        avg_cost_price: '',
        current_price: '',
        fund_name: '',
        units: '',
        nav: '',
        current_nav: '',
        cost_value: '',
        current_value: '',
      });
      onComplete();
    } catch (err: any) {
      setManualError(err.message || 'Failed to save');
    } finally {
      setSavingManual(false);
    }
  };

  // ===== CHOOSE VIEW =====
  if (mode === 'choose') {
    const hasHoldings = stocks.length > 0 || mfs.length > 0;
    return (
      <div className="glass-dark rounded-lg p-8 text-center space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">
            {hasHoldings ? 'Add More Holdings' : 'Add Your Portfolio'}
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            {hasHoldings
              ? 'Upload more holdings or add them one at a time.'
              : 'Upload your portfolio from Kuvera, your broker, or add manually. Nothing is fabricated or pre-filled.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setMode('upload')}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload (CSV/XLS)
          </button>
          <button
            onClick={() => setMode('manual')}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Add Manually
          </button>
          {hasHoldings && (
            <button
              onClick={() => setMode('edit-holdings')}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit Holdings
            </button>
          )}
        </div>
      </div>
    );
  }

  // ===== UPLOAD VIEW =====
  if (mode === 'upload') {
    return (
      <div className="glass-dark rounded-lg p-8">
        <button
          onClick={() => setMode('choose')}
          className="text-xs text-slate-400 mb-4 hover:text-white"
        >
          ← Back
        </button>
        <h2 className="text-lg font-semibold mb-4">Upload Holdings</h2>

        <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-600">
          <p className="text-sm text-slate-300 mb-3">
            <strong>Supported formats:</strong> CSV (Excel/Google Sheets export) or XLS
            (Excel files). Required columns vary by type:
          </p>
          <ul className="text-xs text-slate-400 space-y-1 mb-4">
            <li>
              <strong>Stocks:</strong> <code>symbol, company_name, quantity, avg_cost_price, current_price</code>
            </li>
            <li>
              <strong>Mutual Funds:</strong> <code>fund_name, cost_value, current_value</code>
              (optional: units, nav, current_nav)
            </li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => handleDownloadTemplate('stocks')}
              className="btn-secondary text-xs flex items-center justify-center gap-2 flex-1"
            >
              <Download className="w-3 h-3" />
              Stock Template
            </button>
            <button
              onClick={() => handleDownloadTemplate('mf')}
              className="btn-secondary text-xs flex items-center justify-center gap-2 flex-1"
            >
              <Download className="w-3 h-3" />
              MF Template
            </button>
          </div>
        </div>

        <label className="block border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-invest-accent transition">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xls,.xlsx"
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
            {uploading
              ? 'Processing...'
              : 'Click to select .csv or .xls file'}
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
            Added {uploadSuccess} holdings. Refreshing...
          </p>
        )}
      </div>
    );
  }

  // ===== MANUAL ENTRY VIEW =====
  if (mode === 'manual') {
    const isStock = form.type === 'stock';
    return (
      <div className="glass-dark rounded-lg p-8">
        <button
          onClick={() => setMode('choose')}
          className="text-xs text-slate-400 mb-4 hover:text-white"
        >
          ← Back
        </button>
        <h2 className="text-lg font-semibold mb-4">Add a Holding Manually</h2>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() =>
              setForm({ ...form, type: 'stock' })
            }
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              isStock
                ? 'bg-invest-accent text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Stock
          </button>
          <button
            onClick={() =>
              setForm({ ...form, type: 'mf' })
            }
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              !isStock
                ? 'bg-invest-accent text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Mutual Fund
          </button>
        </div>

        <form onSubmit={handleManualSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isStock ? (
            <>
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
                  placeholder="Larsen & Toubro"
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
                <label className="text-xs text-slate-400 mb-1 block">Avg Cost (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.avg_cost_price}
                  onChange={(e) => setForm({ ...form, avg_cost_price: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-invest-accent"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-400 mb-1 block">Current Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.current_price}
                  onChange={(e) => setForm({ ...form, current_price: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-invest-accent"
                  placeholder="Defaults to cost if empty"
                />
              </div>
            </>
          ) : (
            <>
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-400 mb-1 block">Fund Name *</label>
                <input
                  value={form.fund_name}
                  onChange={(e) => setForm({ ...form, fund_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-invest-accent"
                  placeholder="HDFC Flexicap Growth Direct"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Units</label>
                <input
                  type="number"
                  step="0.001"
                  value={form.units}
                  onChange={(e) => setForm({ ...form, units: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-invest-accent"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">NAV (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.nav}
                  onChange={(e) => setForm({ ...form, nav: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-invest-accent"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Current NAV (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.current_nav}
                  onChange={(e) => setForm({ ...form, current_nav: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-invest-accent"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Cost Value (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.cost_value}
                  onChange={(e) => setForm({ ...form, cost_value: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-invest-accent"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Current Value (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.current_value}
                  onChange={(e) => setForm({ ...form, current_value: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-invest-accent"
                  required
                />
              </div>
            </>
          )}

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
            Add {isStock ? 'Stock' : 'Fund'}
          </button>
        </form>
      </div>
    );
  }

  // ===== EDIT HOLDINGS VIEW =====
  if (mode === 'edit-holdings') {
    return (
      <div className="glass-dark rounded-lg p-8">
        <button
          onClick={() => setMode('choose')}
          className="text-xs text-slate-400 mb-4 hover:text-white"
        >
          ← Back
        </button>
        <h2 className="text-lg font-semibold mb-4">Your Holdings</h2>

        <div className="space-y-3">
          {stocks.map((stock) => (
            <HoldingRow
              key={`stock-${stock.id}`}
              holding={{
                id: stock.id,
                name: `${stock.symbol} (${stock.owner_name})`,
                value: stock.value_at_market,
              }}
              onDelete={async () => {
                // Delete is handled in HoldingsOverview now, refresh from there
                onComplete();
              }}
            />
          ))}
          {mfs.map((fund) => (
            <HoldingRow
              key={`mf-${fund.id}`}
              holding={{
                id: fund.id,
                name: fund.fund_name,
                value: fund.current_value,
              }}
              onDelete={async () => {
                onComplete();
              }}
            />
          ))}
          {stocks.length === 0 && mfs.length === 0 && (
            <p className="text-sm text-slate-400">No holdings to edit.</p>
          )}
        </div>
      </div>
    );
  }

  return null;
}

function HoldingRow({
  holding,
  onDelete,
}: {
  holding: { id: number; name: string; value: number };
  onDelete: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="flex items-center justify-between p-3 border border-slate-600 rounded-lg">
      <div>
        <p className="font-medium">{holding.name}</p>
        <p className="text-xs text-slate-400">₹{holding.value.toLocaleString('en-IN')}</p>
      </div>
      <button
        onClick={async () => {
          if (confirm(`Remove ${holding.name}?`)) {
            setDeleting(true);
            await onDelete();
          }
        }}
        disabled={deleting}
        className="text-slate-500 hover:text-loss transition disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
