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
        }
      } catch (err) {
        console.error('Failed to fetch market data:', err);
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
      ) : (
        <div className="flex gap-4">
          {data.map((item) => (
            <div key={item.symbol} className="flex items-center gap-2">
              <span className="text-slate-300 font-medium">{item.name}</span>
              <span className="font-semibold">
                {item.price.toLocaleString('en-IN', {
                  maximumFractionDigits: 0,
                })}
              </span>
              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  item.isPositive ? 'text-gain' : 'text-loss'
                }`}
              >
                {item.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>
                  {item.isPositive ? '+' : ''}
                  {item.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
