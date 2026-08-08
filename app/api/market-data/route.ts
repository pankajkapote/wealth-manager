import { NextResponse } from 'next/server';

// Yahoo Finance's public chart endpoint - no API key required, but it's an
// unofficial endpoint that can change or rate-limit without notice. If it
// stops working, swap in a paid provider (e.g. Twelve Data, Alpha Vantage)
// here without touching the frontend.
const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

interface IndexQuote {
  symbol: string;
  label: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  error?: string;
}

async function fetchIndex(yahooSymbol: string, label: string): Promise<IndexQuote> {
  try {
    const res = await fetch(`${YAHOO_BASE}/${encodeURIComponent(yahooSymbol)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return { symbol: yahooSymbol, label, price: null, change: null, changePercent: null, error: `HTTP ${res.status}` };
    }

    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta || typeof meta.regularMarketPrice !== 'number') {
      return { symbol: yahooSymbol, label, price: null, change: null, changePercent: null, error: 'No data' };
    }

    const price = meta.regularMarketPrice;
    const prevClose = meta.previousClose ?? meta.chartPreviousClose;
    const change = typeof prevClose === 'number' ? price - prevClose : null;
    const changePercent =
      change !== null && prevClose ? (change / prevClose) * 100 : null;

    return { symbol: yahooSymbol, label, price, change, changePercent };
  } catch (err: any) {
    return {
      symbol: yahooSymbol,
      label,
      price: null,
      change: null,
      changePercent: null,
      error: err.message || 'Fetch failed',
    };
  }
}

export async function GET() {
  const [sensex, nifty] = await Promise.all([
    fetchIndex('^BSESN', 'SENSEX'),
    fetchIndex('^NSEI', 'NIFTY 50'),
  ]);

  return NextResponse.json({
    indices: [sensex, nifty],
    fetchedAt: new Date().toISOString(),
  });
}
