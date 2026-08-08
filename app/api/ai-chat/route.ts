import { NextRequest, NextResponse } from 'next/server';

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

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

    if (!CLAUDE_API_KEY) {
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 500 }
      );
    }

    // Build the system prompt with portfolio context
    const systemPrompt = `You are a personal investment wealth manager AI assistant. You have access to the user's complete investment portfolio and provide actionable insights, not noise.

User's Portfolio Context:
- Total Portfolio Value: ₹${context.portfolio.totalValue.toLocaleString('en-IN')}
- Total Invested: ₹${context.portfolio.totalInvested.toLocaleString('en-IN')}
- Number of Holdings: ${context.portfolio.holdings}

Recent AI Insights Generated:
${context.recentInsights
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
- Factor in dividend yields and tax-loss harvesting opportunities`;

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1',
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
      const error = await response.text();
      console.error('Claude API Error:', error);
      return NextResponse.json(
        { error: 'Failed to get AI response' },
        { status: 500 }
      );
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };
    const aiResponse =
      data.content[0].type === 'text'
        ? data.content[0].text
        : 'Unable to process response';

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
