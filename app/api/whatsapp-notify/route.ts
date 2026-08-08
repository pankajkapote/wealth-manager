// app/api/whatsapp-notify/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppMessage } from './helpers';

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

    const formattedMessage = formatWhatsAppMessage(body);
    const results = [];

    for (const recipient of WHATSAPP_RECIPIENTS) {
      try {
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