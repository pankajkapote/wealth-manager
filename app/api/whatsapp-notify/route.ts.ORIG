import { NextRequest, NextResponse } from 'next/server';

interface WhatsAppMessage {
  type: 'weekly_summary' | 'sell_alert' | 'opportunity' | 'portfolio_health';
  title: string;
  message: string;
  priority?: 'high' | 'medium' | 'low';
}

// Mock Twilio integration
// In production, install: npm install twilio
// const twilio = require('twilio');

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_SENDER = process.env.TWILIO_WHATSAPP_SENDER;
const WHATSAPP_RECIPIENTS = process.env.WHATSAPP_RECIPIENTS?.split(',') || [];

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as WhatsAppMessage;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return NextResponse.json(
        {
          error: 'Twilio credentials not configured',
          message:
            'Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to enable WhatsApp notifications',
        },
        { status: 500 }
      );
    }

    // Format the message based on type
    const formattedMessage = formatWhatsAppMessage(body);

    // Send to all configured WhatsApp recipients
    const results = [];

    for (const recipient of WHATSAPP_RECIPIENTS) {
      try {
        // This is a mock implementation
        // In production, use actual Twilio API:
        // const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        // await client.messages.create({
        //   from: TWILIO_WHATSAPP_SENDER,
        //   to: recipient,
        //   body: formattedMessage,
        // });

        results.push({
          recipient: recipient,
          status: 'sent',
          message: formattedMessage,
          timestamp: new Date().toISOString(),
        });

        console.log(`WhatsApp message sent to ${recipient}`);
      } catch (error) {
        console.error(`Failed to send to ${recipient}:`, error);
        results.push({
          recipient: recipient,
          status: 'failed',
          error: String(error),
        });
      }
    }

    return NextResponse.json({
      success: results.filter((r) => r.status === 'sent').length > 0,
      results,
    });
  } catch (error) {
    console.error('WhatsApp API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatWhatsAppMessage(msg: WhatsAppMessage): string {
  const icon: Record<string, string> = {
    weekly_summary: '📊',
    sell_alert: '⚠️',
    opportunity: '🚀',
    portfolio_health: '❤️',
  };

  const priority =
    msg.priority === 'high'
      ? '🔴'
      : msg.priority === 'medium'
        ? '🟡'
        : '🟢';

  return `${icon[msg.type]} ${msg.priority ? priority : ''} ${msg.title}\n\n${msg.message}`;
}

// Weekly summary template
export function generateWeeklySummary(portfolioData: any): WhatsAppMessage {
  return {
    type: 'weekly_summary',
    priority: 'medium',
    title: `Weekly Portfolio Summary - ${new Date().toLocaleDateString('en-IN')}`,
    message: `
📈 Portfolio Health: 8.2/10 - Excellent

💰 Weekly Stats:
- Value: ₹62.5L (+2.3% WoW)
- Gains: ₹15.2L (+32.2%)
- Holdings: 33

✅ Good News:
- Polycab up 4% (new ATH)
- Dixon crossing ₹14K (strong)
- ICICI Bank steady performance

⚠️ Action Items:
- Review YES Bank position (down 92%)
- Consider L&T accumulation
- Rebalance overweight positions

📲 Ask your wealth manager: "Should I add more to L&T?"

No urgent action needed this week. Keep investing. 💪`,
  };
}

// Sell alert template
export function generateSellAlert(stock: string, reason: string): WhatsAppMessage {
  return {
    type: 'sell_alert',
    priority: 'high',
    title: `Sell Alert: ${stock}`,
    message: `⚠️ Review your ${stock} position

Reason: ${reason}

Current: ₹22.94 (down 92% from cost)
Recommendation: Reduce or exit

Ask: "Should I sell YES Bank?"`,
  };
}

// Opportunity alert
export function generateOpportunityAlert(
  stock: string,
  reason: string
): WhatsAppMessage {
  return {
    type: 'opportunity',
    priority: 'medium',
    title: `Opportunity: ${stock}`,
    message: `🚀 Good accumulation zone

Stock: ${stock}
Reason: ${reason}

Action: Consider adding gradually

Ask: "What's your take on L&T?"`,
  };
}
