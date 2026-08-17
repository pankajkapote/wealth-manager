import { NextRequest, NextResponse } from 'next/server';

interface CachedData {
  data: any;
  timestamp: number;
}

const CACHE_DURATION = 60 * 1000; // 60 seconds
let cache: { [key: string]: CachedData } = {};

async function fetchFromYahooFinance(symbol: string): Promise<any> {
  try {
    // Yahoo Finance API endpoint
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error(`Yahoo Finance error for ${symbol}:`, response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch ${symbol}:`, error);
    return null;
  }
}

async function fetchQuote(symbol: string): Promise<{
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}> {
  // Check cache first
  const cached = cache[symbol];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // Try alternate Yahoo Finance endpoint
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.chart?.result?.[0]) {
      throw new Error('Invalid response structure');
    }

    const result = data.chart.result[0];
    const meta = result.meta;
    const quote = result.quote?.[0];

    if (!quote) {
      throw new Error('No quote data');
    }

    const currentPrice = quote.close?.[quote.close.length - 1] || meta.regularMarketPrice || 0;
    const previousClose = meta.previousClose || currentPrice;
    const change = currentPrice - previousClose;
    const changePercent = previousClose ? (change / previousClose) * 100 : 0;

    const result_data = {
      symbol: meta.symbol || symbol,
      price: currentPrice,
      change,
      changePercent,
      timestamp: new Date().toISOString(),
    };

    // Cache the result
    cache[symbol] = {
      data: result_data,
      timestamp: Date.now(),
    };

    return result_data;
  } catch (error: any) {
    console.error(`Error fetching quote for ${symbol}:`, error.message);

    // Return cached data if available (even if expired)
    if (cache[symbol]) {
      return cache[symbol].data;
    }

    // Return fallback data
    return {
      symbol,
      price: 0,
      change: 0,
      changePercent: 0,
      timestamp: new Date().toISOString(),
      error: 'Unable to fetch real-time data',
    };
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const symbols = searchParams.getAll('symbols') || ['^NSEI', '^BSESN'];

    if (symbols.length === 0) {
      return NextResponse.json(
        { error: 'At least one symbol required' },
        { status: 400 }
      );
    }

    // Fetch all symbols in parallel
    const quotes = await Promise.all(
      symbols.map((symbol) => fetchQuote(symbol))
    );

    // Map to friendly names
    const data = quotes.map((quote) => {
      let name = quote.symbol;
      if (quote.symbol === '^NSEI') name = 'NIFTY 50';
      if (quote.symbol === '^BSESN') name = 'SENSEX';

      return {
        name,
        symbol: quote.symbol,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        isPositive: quote.change >= 0,
        timestamp: quote.timestamp,
      };
    });

    return NextResponse.json({ data, timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error('Market data error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}

// Clear cache every 5 minutes
setInterval(() => {
  cache = {};
  console.log('[Market Data] Cache cleared');
}, 5 * 60 * 1000);
