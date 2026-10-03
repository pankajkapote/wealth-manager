import { NextRequest, NextResponse } from 'next/server';

// Use fetch for APIs to avoid SDK type issues
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const COHERE_API_KEY = process.env.COHERE_API_KEY;

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const TAVILY_ENDPOINT = 'https://api.tavily.com/search';
const COHERE_ENDPOINT = 'https://api.cohere.ai/v1/generate';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

async function callGemini(
  systemPrompt: string,
  messages: Message[]
): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Convert to Gemini format
    const contents = messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Add system prompt as first user message if needed
    const finalContents =
      contents.length === 0
        ? [{ role: 'user' as const, parts: [{ text: systemPrompt }] }]
        : [
            { role: 'user' as const, parts: [{ text: systemPrompt }] },
            ...contents,
          ];

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: finalContents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No text in Gemini response');
    }

    return { success: true, text };
  } catch (err: any) {
    console.error('Gemini error:', err.message);
    return { success: false, error: err.message };
  }
}

async function callGroq(
  systemPrompt: string,
  messages: Message[]
): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured');
    }

    // Convert to OpenAI format
    const groqMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Groq error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error('No text in Groq response');
    }

    return { success: true, text };
  } catch (err: any) {
    console.error('Groq error:', err.message);
    return { success: false, error: err.message };
  }
}

async function researchWithTavily(
  query: string
): Promise<{ success: boolean; findings?: string; error?: string }> {
  try {
    if (!TAVILY_API_KEY) {
      return { success: false, error: 'TAVILY_API_KEY not configured' };
    }

    const response = await fetch(TAVILY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        max_results: 5,
        include_answer: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily error: ${response.statusText}`);
    }

    const data = await response.json();
    const answer = data.answer || '';
    const results = data.results?.map((r: any) => `- ${r.title}: ${r.url}`) || [];

    const findings = `${answer}\n\nReferences:\n${results.join('\n')}`;
    return { success: true, findings };
  } catch (err: any) {
    console.error('Tavily error:', err.message);
    return { success: false, error: err.message };
  }
}

async function researchWithCohere(
  query: string
): Promise<{ success: boolean; findings?: string; error?: string }> {
  try {
    if (!COHERE_API_KEY) {
      return { success: false, error: 'COHERE_API_KEY not configured' };
    }

    const response = await fetch(COHERE_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Research query: ${query}\n\nProvide a brief, factual research summary:`,
        max_tokens: 300,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      throw new Error(`Cohere error: ${response.statusText}`);
    }

    const data = await response.json();
    const findings = data.generations?.[0]?.text || '';

    return { success: true, findings };
  } catch (err: any) {
    console.error('Cohere error:', err.message);
    return { success: false, error: err.message };
  }
}

async function researchTopic(query: string): Promise<string> {
  // Try Tavily first (better for finance research)
  const tavilyResult = await researchWithTavily(query);
  if (tavilyResult.success && tavilyResult.findings) {
    return tavilyResult.findings;
  }

  // Fallback to Cohere
  const cohereResult = await researchWithCohere(query);
  if (cohereResult.success && cohereResult.findings) {
    return cohereResult.findings;
  }

  return '(Research unavailable)';
}

export async function POST(req: NextRequest) {
  try {
    const { messages, portfolio_context } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 });
    }

    // Check if API keys are configured
    if (!GEMINI_API_KEY && !GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'No LLM API keys configured. Set GEMINI_API_KEY or GROQ_API_KEY.' },
        { status: 500 }
      );
    }

    // Build system prompt with portfolio context
    const systemPrompt = portfolio_context
      ? `You are a personal wealth advisor AI analyzing an Indian investor's portfolio.

Portfolio Summary:
- Total Value: ₹${portfolio_context.totalValue?.toLocaleString('en-IN') || '0'}
- Total Invested: ₹${portfolio_context.totalInvested?.toLocaleString('en-IN') || '0'}
- Unrealized Gains: ₹${portfolio_context.totalGains?.toLocaleString('en-IN') || '0'} (${portfolio_context.gainPercentage?.toFixed(1) || '0'}%)
- Holdings: ${portfolio_context.holdingsCount || 0} (${portfolio_context.stockCount || 0} stocks, ${portfolio_context.mfCount || 0} MF schemes)

Top Gainers: ${
          portfolio_context.topGainers
            ?.slice(0, 3)
            .map(
              (h: any) =>
                `${h?.symbol || h?.fund_name || 'Unknown'} (+${(h?.gain_loss_percent ?? 0).toFixed(1)}%)`
            )
            .join(', ') || 'N/A'
        }
Top Losers: ${
          portfolio_context.topLosers
            ?.slice(0, 3)
            .map(
              (h: any) =>
                `${h?.symbol || h?.fund_name || 'Unknown'} (${(h?.gain_loss_percent ?? 0).toFixed(1)}%)`
            )
            .join(', ') || 'N/A'
        }

Provide concise, actionable insights. Format responses for Indian investors (use ₹ symbol, Indian market context).`
      : `You are a friendly personal wealth advisor. Help users with investment advice and portfolio analysis for Indian investors. Use ₹ symbol and Indian market context.`;

    // Try Gemini first
    console.log('📊 Attempting Gemini...');
    let result = await callGemini(systemPrompt, messages);

    // Fallback to Groq if Gemini fails
    if (!result.success) {
      console.log('⚠️ Gemini failed, trying Groq...');
      result = await callGroq(systemPrompt, messages);
    }

    // If both LLMs fail, return error
    if (!result.success) {
      return NextResponse.json(
        { error: `No LLM available: Gemini (${result.error}) | Groq failed` },
        { status: 503 }
      );
    }

    const responseText = result.text || 'No response generated';

    return NextResponse.json({
      message: responseText,
      model: result.success ? 'gemini-2.0-flash' : 'mixtral-8x7b-32768',
      usage: {
        input_tokens: 0, // Gemini doesn't expose token counts in free tier
        output_tokens: 0,
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

// Optional: Research endpoint for portfolio topics
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('research');

    if (!query) {
      return NextResponse.json({ error: 'research query required' }, { status: 400 });
    }

    const findings = await researchTopic(query);

    return NextResponse.json({
      query,
      findings,
      sources: ['Tavily (primary)', 'Cohere (fallback)'],
    });
  } catch (error: any) {
    console.error('Research Error:', error);
    return NextResponse.json({ error: error.message || 'Research failed' }, { status: 500 });
  }
}
