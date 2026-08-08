import { NextRequest, NextResponse } from 'next/server';

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// Default to Haiku — it's far cheaper than Sonnet/Opus and plenty capable
// for portfolio Q&A. Override with CLAUDE_MODEL env var in Vercel if you
// ever want a stronger model (e.g. 'claude-sonnet-4-5') for harder questions.
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';

interface PortfolioContext {
  portfolio: {
    totalValue: number;
    totalInvested: number;
    holdings: number;
  };
  recentInsights: Array<{
    title: string;
    description: string;
    type: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = body as {
      message: string;
      context: PortfolioContext;
    };

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!CLAUDE_API_KEY) {
      console.error('CLAUDE_API_KEY is not set in environment variables');
      return NextResponse.json(
        {
          error: 'Claude API key not configured',
          message:
            'Set CLAUDE_API_KEY in your Vercel project → Settings → Environment Variables, then redeploy.',
        },
        { status: 500 }
      );
    }

    const systemPrompt = `You are a personal investment wealth manager AI assistant. You have access to the user's complete investment portfolio and provide actionable insights, not noise.

User's Portfolio Context:
- Total Portfolio Value: ₹${context?.portfolio?.totalValue?.toLocaleString('en-IN') ?? 'unknown'}
- Total Invested: ₹${context?.portfolio?.totalInvested?.toLocaleString('en-IN') ?? 'unknown'}
- Number of Holdings: ${context?.portfolio?.holdings ?? 'unknown'}

Recent AI Insights Generated:
${(context?.recentInsights || [])
  .map((insight) => `- ${insight.type}: ${insight.title} - ${insight.description}`)
  .join('\n')}

Your role is to:
1. Answer investment questions with specific data from their portfolio
2. Provide SMART (Specific, Measurable, Achievable, Relevant, Time-bound) recommendations
3. Always explain the reasoning behind suggestions
4. Consider tax implications and Indian investment context
5. Be concise - avoid unnecessary jargon
6. Help with portfolio rebalancing decisions
7. Explain when to buy/sell/hold with conviction levels

Guidelines:
- Always be honest about risks
- Suggest consulting a financial advisor for major decisions
- Use Indian Rupee (₹) and Indian context
- Focus on long-term wealth creation (20+ year horizon based on user's profile)
- Consider both direct stocks and mutual funds
- Evaluate concentration risk
- Factor in dividend yields and tax-loss harvesting opportunities

Keep responses under 200 words unless the question genuinely needs more detail.`;

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 500,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Claude API Error:', response.status, errorBody);

      // Surface the real reason instead of a generic 500 - makes debugging
      // in Vercel logs / browser network tab instant instead of guesswork.
      let parsedMessage = errorBody;
      try {
        const parsed = JSON.parse(errorBody);
        parsedMessage = parsed?.error?.message || errorBody;
      } catch {
        // errorBody wasn't JSON, use as-is
      }

      return NextResponse.json(
        {
          error: 'Claude API request failed',
          status: response.status,
          message: parsedMessage,
        },
        { status: response.status }
      );
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };

    const textBlock = data.content.find((block) => block.type === 'text');
    const aiResponse = textBlock?.text || 'Unable to process response';

    return NextResponse.json({
      response: aiResponse,
      model: CLAUDE_MODEL,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
