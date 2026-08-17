import { NextRequest, NextResponse } from 'next/server';

const SELECTED_MODEL = process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';
const API_KEY = process.env.CLAUDE_API_KEY;
const API_URL = 'https://api.anthropic.com/v1/messages';

export async function POST(req: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'CLAUDE_API_KEY not configured in environment' },
        { status: 500 }
      );
    }

    const { messages, portfolio_context } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'messages array required' },
        { status: 400 }
      );
    }

    // Build system prompt with portfolio context
    const systemPrompt = portfolio_context
      ? `You are a personal wealth advisor AI analyzing an Indian investor's portfolio.

Portfolio Summary:
- Total Value: ₹${portfolio_context.totalValue?.toLocaleString('en-IN')}
- Total Invested: ₹${portfolio_context.totalInvested?.toLocaleString('en-IN')}
- Unrealized Gains: ₹${portfolio_context.totalGains?.toLocaleString('en-IN')} (${portfolio_context.gainPercentage?.toFixed(1)}%)
- Holdings: ${portfolio_context.holdingsCount || 0} (${portfolio_context.stockCount || 0} stocks, ${portfolio_context.mfCount || 0} MF schemes)

Top Gainers: ${portfolio_context.topGainers?.slice(0, 3).map((h: any) => `${('symbol' in h ? h.symbol : h.fund_name)} (+${h.gain_loss_percent?.toFixed(1)}%)`).join(', ')}
Top Losers: ${portfolio_context.topLosers?.slice(0, 3).map((h: any) => `${('symbol' in h ? h.symbol : h.fund_name)} (${h.gain_loss_percent?.toFixed(1)}%)`).join(', ')}

Provide concise, actionable insights. Format responses for Indian investors (use ₹ symbol, Indian market context).`
      : `You are a friendly personal wealth advisor. Help users with investment advice and portfolio analysis for Indian investors. Use ₹ symbol and Indian market context.`;

    // Call Claude API via HTTP
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: SELECTED_MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Anthropic API Error:', errorData);

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Check CLAUDE_API_KEY.' },
          { status: 401 }
        );
      }
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limited. Please retry later.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: errorData.error?.message || 'API request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract text from response
    const textContent = data.content?.find((block: any) => block.type === 'text');
    const responseText = textContent?.text || 'No response generated';

    return NextResponse.json({
      message: responseText,
      model: SELECTED_MODEL,
      usage: {
        input_tokens: data.usage?.input_tokens || 0,
        output_tokens: data.usage?.output_tokens || 0,
      },
    });
  } catch (error: any) {
    console.error('AI Chat Error:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
