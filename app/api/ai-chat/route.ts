import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';
const SELECTED_MODEL = process.env.CLAUDE_MODEL || DEFAULT_MODEL;

export async function POST(req: NextRequest) {
  try {
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

    // Call Claude API
    const response = await client.messages.create({
      model: SELECTED_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    // Extract text from response
    const textBlock = response.content.find((block: any) => block.type === 'text');
    const responseText = textBlock
      ? (textBlock as any).text
      : 'No response generated';

    return NextResponse.json({
      message: responseText,
      model: SELECTED_MODEL,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    });
  } catch (error: any) {
    console.error('AI Chat Error:', error);

    // Detailed error responses
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Invalid API key. Check CLAUDE_API_KEY in environment.' },
        { status: 401 }
      );
    }
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limited. Please wait before retrying.' },
        { status: 429 }
      );
    }
    if (error.message?.includes('model')) {
      return NextResponse.json(
        {
          error: `Model error: ${error.message}. Using: ${SELECTED_MODEL}. Check CLAUDE_MODEL env var.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    );
  }
}
