'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface MarketData {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
  timestamp: string;
}

export default function MarketTicker() {
  const [data, setData] = useState<MarketData[]>([]);
  const [time, setTime] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch market data
    const fetchMarketData = async () => {
      try {
        const response = await fetch(
          '/api/market-data?symbols=^NSEI&symbols=^BSESN'
        );
        if (response.ok) {
          const result = await response.json();
          setData(result.data || []);
          setError(null);
        } else {
          setError('Failed to fetch market data');
        }
      } catch (err) {
        console.error('Failed to fetch market data:', err);
        setError('Market data unavailable');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  // Update time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-1 text-slate-400">
        <Clock className="w-4 h-4" />
        <span className="font-mono">{time || '--:--:--'}</span>
      </div>

      {loading ? (
        <div className="flex gap-4">
          <div className="h-4 w-32 bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-slate-700 rounded animate-pulse"></div>
        </div>
      ) : error ? (
        <div className="flex gap-4 text-slate-500 text-xs">
          <span>Market data unavailable</span>
        </div>
      ) : data && data.length > 0 ? (
        <div className="flex gap-4">
          {data.map((item) => {
            // Safe access with defaults
            const price = item?.price ?? 0;
            const changePercent = item?.changePercent ?? 0;
            const isPositive = item?.isPositive ?? false;

            return (
              <div key={item?.symbol || 'unknown'} className="flex items-center gap-2">
                <span className="text-slate-300 font-medium">{item?.name || 'N/A'}</span>
                <span className="font-semibold">
                  {price > 0
                    ? price.toLocaleString('en-IN', {
                        maximumFractionDigits: 0,
                      })
                    : '--'}
                </span>
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    isPositive ? 'text-gain' : 'text-loss'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {isPositive ? '+' : ''}
                    {changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex gap-4 text-slate-500 text-xs">
          <span>No market data</span>
        </div>
      )}
    </div>
  );
}
