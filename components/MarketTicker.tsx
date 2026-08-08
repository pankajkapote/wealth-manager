'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface IndexQuote {
  symbol: string;
  label: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  error?: string;
}

export default function MarketTicker() {
  const [now, setNow] = useState<Date | null>(null);
  const [indices, setIndices] = useState<IndexQuote[]>([]);
  const [marketError, setMarketError] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const clockTimer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const res = await fetch('/api/market-data');
        const data = await res.json();
        setIndices(data.indices || []);
        setMarketError(false);
      } catch {
        setMarketError(true);
      }
    };

    fetchMarketData();
    const marketTimer = setInterval(fetchMarketData, 60000); // refresh every minute
    return () => clearInterval(marketTimer);
  }, []);

  // Avoid SSR/CSR mismatch on the clock by not rendering time until mounted.
  if (!now) return null;

  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
      <span>
        {dateStr} · {timeStr} IST
      </span>

      {indices.map((idx) => (
        <span key={idx.symbol} className="flex items-center gap-1">
          <span className="text-slate-300 font-medium">{idx.label}</span>
          {idx.price !== null ? (
            <>
              <span>{idx.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              <span
                className={`flex items-center gap-0.5 ${
                  (idx.change ?? 0) >= 0 ? 'text-gain' : 'text-loss'
                }`}
              >
                {(idx.change ?? 0) >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {idx.changePercent !== null ? `${idx.changePercent.toFixed(2)}%` : ''}
              </span>
            </>
          ) : (
            <span className="text-slate-600">unavailable</span>
          )}
        </span>
      ))}
      {marketError && <span className="text-slate-600">Market data unavailable</span>}
    </div>
  );
}
