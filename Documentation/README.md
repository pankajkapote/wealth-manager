# Personal AI Wealth Manager PWA

**Your personal investment analyst powered by Claude AI. Get actionable insights, not noise.**

## 🎯 Overview

A progressive web app that understands your complete family portfolio (stocks, mutual funds, VPF, NPS, real estate) and provides personalized investment recommendations through:

- **Portfolio Health Score** (1-10 scale)
- **AI-Powered Insights** (using Claude API)
- **Monthly Capital Allocation Advisor**
- **Sell Alert System** (know when to exit)
- **WhatsApp Weekly Summaries** (Twilio integration)
- **Smart Holdings Analysis**
- **Valuation-Based Recommendations**

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+
- Git
- Claude API key (you already have this)
- Supabase account (free tier available)
- Twilio account (optional, for WhatsApp notifications)

### 2. Clone & Setup

```bash
git clone <your-repo-url>
cd wealth-manager

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local
```

### 3. Configure Environment

Edit `.env.local`:

```env
# Claude API (your existing subscription)
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxx

# Supabase (free tier: https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxx

# Twilio (optional, for WhatsApp)
# Free trial at https://www.twilio.com/try-twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_token_here
TWILIO_WHATSAPP_SENDER=whatsapp:+14155238886
WHATSAPP_RECIPIENTS=whatsapp:+919876543210,whatsapp:+919876543211
```

### 4. Database Setup

**Supabase Setup:**
1. Create account at https://supabase.com
2. Create new project
3. Go to SQL Editor
4. Paste contents of `supabase-schema.sql`
5. Run the SQL to create tables

### 5. Development

```bash
npm run dev
```

Visit `http://localhost:3000`

### 6. Build & Deploy (Vercel)

```bash
# Login to Vercel
npm install -g vercel
vercel login

# Deploy
vercel
```

Or connect GitHub repo to Vercel dashboard for auto-deploys.

## 📱 Features

### 1. Portfolio Dashboard
- Real-time portfolio value
- Unrealized gains/losses
- Health score visualization
- Asset allocation charts

### 2. Holdings Overview
- All 30+ stocks with detailed metrics
- Mutual fund performance
- Sector-wise breakdown
- Top gainers/losers

### 3. AI-Powered Insights
- Powered by Claude API
- Personalized stock recommendations
- Sell/hold/buy signals
- Valuation analysis
- WhatsApp integration for notifications

### 4. Monthly Capital Allocator
- Smart allocation suggestions
- Reasoning for each recommendation
- Risk-adjusted positioning
- 10% cash reserve for opportunities
- Implementation roadmap

### 5. Portfolio Health Score
- 6 key metrics analyzed:
  - Concentration risk
  - Diversification
  - Valuation health
  - Debt exposure
  - Income stability
  - Risk adjustment

### 6. WhatsApp Alerts
- Weekly portfolio summary
- Sell alerts (promoter selling, debt increase, etc.)
- Opportunity alerts (valuation dips)
- Real-time market news

## 📊 Your Portfolio Data

### Pre-loaded Holdings:

**Pankaj's Stocks (30 holdings):**
- ICICI Bank, HDFC Bank, ICICI Securities
- L&T, Dixon, Maruti, Polycab
- Bajaj Finance, Infosys, TCS
- And 20+ others with full metrics

**Manjiri's Stocks (11 holdings):**
- Polycab, Muthoot Finance
- Amber, Eternal, IRCTC
- And others with complete data

**Mutual Funds:**
- HDFC Flexicap Growth Direct (₹2.2L)
- Parag Parikh Flexi Cap (₹2.5L)
- Baroda BNP Small Cap (₹4.1L)

## 🤖 Claude API Integration

The app uses Claude API for:

```javascript
// AI Chat (ask anything about portfolio)
"Should I sell YES Bank?"
"Is my portfolio too concentrated?"
"Can I retire at 55?"

// Automated Insights
- Daily noise filtering
- Quarterly results analysis
- Valuation comparisons
- Sell recommendation triggers

// Market Data Analysis
- NSE/BSE announcements
- Insider buying/selling
- Promoter pledges
- Credit rating changes
```

**Cost Estimate:** ~₹50-200/month depending on usage (you already have subscription)

## 📲 Twilio WhatsApp Setup

### Get Free Trial:
1. Sign up: https://www.twilio.com/try-twilio
2. Verify phone number
3. Get trial WhatsApp sender number
4. Get test recipient numbers

### Sending WhatsApp Messages:

```javascript
// Weekly summary
await fetch('/api/whatsapp-notify', {
  method: 'POST',
  body: JSON.stringify({
    type: 'weekly_summary',
    title: 'Weekly Portfolio Update',
    message: '...'
  })
});

// Sell alert
await fetch('/api/whatsapp-notify', {
  method: 'POST',
  body: JSON.stringify({
    type: 'sell_alert',
    title: 'Sell Alert: YES Bank',
    message: '...',
    priority: 'high'
  })
});
```

### Production Pricing:
- Inbound message: ₹0.50
- Outbound message: ₹1.20
- (Free trial: 5000 credits = ~₹5000 usage)

## 📈 Sample Insights Generated

Based on your portfolio data:

### ⚠️ High Priority
**YES Bank:** Down 92% from cost (₹301 → ₹22.94)
- Recommendation: Reduce by 50% immediately
- Better opportunities: ICICI Bank, Hcl Finance

### 🚀 Opportunity
**L&T:** PE = 22 (20% below 5-year avg)
- Strong order book for next 3 years
- Dividend yield: 2.5%
- Recommendation: Accumulate gradually

### ✓ Hold
**Polycab:** Premium justified at PE 54
- Growth story intact (CAGR 25%+)
- Market leader position
- Exit target: ₹12,500

### ↔️ Rebalance
**ICICI Bank:** Now 14% of portfolio (target: 10%)
- Strong performer causing overweight
- Trim 25% and redeploy to underweights

## 🔒 Security & Privacy

- **Zero-Knowledge Architecture:** Your data stays in Supabase (you control the DB)
- **End-to-End Encryption:** Sensitive data encrypted client-side
- **Row-Level Security:** RLS policies ensure only you can access your data
- **No Third-Party Ad Networks:** Privacy-first design
- **Local Caching:** Works offline (PWA)

## 📱 PWA Installation

### iOS:
1. Open Safari
2. Tap Share → Add to Home Screen
3. Name it "Wealth Manager"
4. Tap Add

### Android:
1. Open Chrome
2. Tap Menu → Install App
3. Or: Menu → More → Create Shortcut

### Desktop:
1. Chrome: Menu → Install wealth manager
2. Edge: Apps → Install this site as app

## 📊 Database Schema

Key tables for your portfolio:

```sql
-- Family members
family_members (name, email, role)

-- Holdings
stock_holdings (symbol, qty, avg_cost, current_price, conviction_level)
mf_holdings (fund_name, units, nav, goal)
other_holdings (vpf, nps, real_estate)

-- Intelligence
ai_insights (type, symbol, recommendation, confidence)
capital_allocation_plans (month, allocation_json)
portfolio_snapshots (daily/weekly historical data)

-- Notifications
whatsapp_logs (message_type, sent_at, status)
sell_recommendations (reason, confidence, expiry)
```

## 🔄 Scheduled Tasks (Next Phase)

Using Vercel Cron or GitHub Actions:

```javascript
// Daily 6 AM
- Fetch NSE/BSE announcements
- Scan market for material events
- Generate noise-filtered alerts

// Every Sunday 9 AM
- Calculate portfolio health score
- Generate weekly summary
- Send WhatsApp update

// Monthly 1st of month
- Generate capital allocation plan
- Review all positions
- Send detailed analysis

// On earnings season
- Parse quarterly results
- Update conviction levels
- Trigger buy/sell/hold updates
```

## 📚 API Routes

```
POST /api/ai-chat
  - Message: string
  - Context: portfolio data
  - Returns: AI response

POST /api/whatsapp-notify
  - Type: weekly_summary | sell_alert | opportunity
  - Title: string
  - Message: string
  - Returns: sent status

GET /api/portfolio
  - Returns: current portfolio data from Supabase

POST /api/update-holdings
  - CSV/Excel file upload
  - Parses and updates holdings

GET /api/market-data
  - Fetches current prices
  - Updates cache
```

## 🛠️ Customization

### Change Monthly Investment Amount
Edit: `components/CapitalAllocator.tsx`
```javascript
const [monthlyInvestment, setMonthlyInvestment] = useState(25000);
```

### Add Your Holdings
1. Edit portfolio data in `components/HoldingsOverview.tsx`
2. Or use data upload feature (in next phase)
3. Syncs automatically with Supabase

### Customize Insights
Edit `components/AIInsights.tsx` to adjust:
- Conviction levels
- Risk thresholds
- Time horizons
- Recommendation styles

## 📈 Next Phase Features

- [ ] Real-time market data integration (NSE API)
- [ ] Bulk upload of holdings via CSV/Excel
- [ ] Tax-loss harvesting recommendations
- [ ] Advanced charting (candlesticks, technical analysis)
- [ ] Multi-family member management
- [ ] Integration with brokers (NSE, BSE direct API)
- [ ] Retirement calculator
- [ ] Goal-based portfolio tracking
- [ ] Mobile app (React Native)
- [ ] Voice AI assistant
- [ ] International stock support

## 📞 Support & Issues

**Claude API Questions:**
- Docs: https://docs.anthropic.com
- Email: support@anthropic.com

**Supabase Issues:**
- Docs: https://supabase.com/docs
- Community: https://github.com/supabase/supabase

**Twilio WhatsApp:**
- Docs: https://www.twilio.com/docs/whatsapp
- Dashboard: https://console.twilio.com

## ⚠️ Disclaimer

This tool provides **analysis and recommendations only**. It is NOT financial advice.

Always:
- Consult a SEBI-registered investment advisor for major decisions
- Do your own research (DYOR)
- Consider your risk profile and goals
- Review holdings quarterly with a professional

**Past performance ≠ Future results**

## 📄 License

MIT License - Feel free to modify and use for personal portfolio management

---

**Built by Pankaj Kapote**
*SAP BASIS Expert, turning portfolio management into a science.*

"Do I need to do anything today? No? Then relax. Nothing requires your attention." — Wealth Manager Philosophy
