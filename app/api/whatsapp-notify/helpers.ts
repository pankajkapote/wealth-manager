// app/api/whatsapp-notify/helpers.ts

export interface WhatsAppMessage {
  type: 'weekly_summary' | 'sell_alert' | 'opportunity' | 'portfolio_health';
  title: string;
  message: string;
  priority?: 'high' | 'medium' | 'low';
}

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