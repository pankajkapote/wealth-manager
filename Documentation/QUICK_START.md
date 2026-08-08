# ⚡ Quick Start: Personal AI Wealth Manager

## What You're Getting

A **Progressive Web App** that acts as your personal investment analyst. It understands your family portfolio (stocks, mutual funds, VPF, NPS) and provides actionable insights via:

- 📊 **Portfolio Dashboard** - Real-time health score (1-10)
- 🤖 **Claude AI Chat** - "Should I sell YES Bank?" → Get instant analysis
- 💰 **Capital Allocator** - Monthly ₹25K allocation plan with rationale
- ⚠️ **Sell Alerts** - Know when to exit (promoter selling, earnings fall)
- 📱 **WhatsApp Weekly Summary** - Friday evening portfolio update
- 📈 **Holdings Analysis** - 30+ stocks with sector allocation

## Pre-loaded with Your Data

Your portfolio is already in the app:

**Pankaj's Holdings:**
- 30 stocks: ICICI Bank, HDFC Bank, L&T, Dixon, Polycab, Maruti, Bajaj Finance, etc.
- Total value: ₹62.5L with +32.2% unrealized gains

**Manjiri's Holdings:**
- 11 stocks: Polycab (₹7.2L), Muthoot Finance, Amber, IRCTC, etc.

**Mutual Funds:**
- HDFC Flexicap (₹2.2L), Parag Parikh (₹2.5L), Baroda Small Cap (₹4.1L)

## 3-Step Setup (15 minutes)

### Step 1: Get API Keys (2 mins)

You already have Claude API subscription. That's it!

Find at: https://console.anthropic.com → Copy API key

Optional: Twilio for WhatsApp (https://www.twilio.com/try-twilio)

### Step 2: Create Free Supabase Database (5 mins)

1. Go to https://supabase.com → Sign up (GitHub login recommended)
2. Create new project (name: `wealth-manager`)
3. Wait 2-3 minutes for setup
4. Go to Settings → API → Copy:
   - Project URL
   - Anon Key

### Step 3: Deploy to Vercel (5 mins)

```bash
# Clone this repo (or download files)
npm install
npm run build

# Deploy
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard:
```
CLAUDE_API_KEY=sk-ant-xxxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

✅ **Done! Your app is live.**

## What's Inside

### 📁 Project Structure
```
wealth-manager/
├── app/
│   ├── page.tsx              # Main dashboard
│   ├── layout.tsx            # App shell
│   ├── globals.css           # Tailwind + custom styles
│   └── api/
│       ├── ai-chat/route.ts  # Claude integration
│       └── whatsapp-notify/  # WhatsApp alerts
├── components/
│   ├── Navigation.tsx        # Sidebar menu
│   ├── PortfolioHealth.tsx   # Health score + charts
│   ├── HoldingsOverview.tsx  # Stock/MF list
│   ├── AIInsights.tsx        # AI insights + chat
│   └── CapitalAllocator.tsx  # Monthly allocation
├── public/
│   └── manifest.json         # PWA config
├── supabase-schema.sql       # Database tables
├── .env.local                # Your secrets (create this)
└── README.md
```

### 🎯 Key Features

**1. Portfolio Health Score (8.2/10)**
- Concentration risk ✓
- Diversification ✓
- Valuation health ✓
- Debt health ✓
- Income stability ✓
- Risk adjustment ✓

**2. AI Insights (Powered by Claude)**
```
Sample: "YES Bank - DOWN 92% from cost"
- Analysis: Negative momentum for 18+ months
- Alternative: ICICI Bank is better positioned
- Action: Reduce by 50%, exit on any bounce
- Confidence: 95%
```

**3. Capital Allocator (Your ₹25K/month)**
```
February 2026 Plan:
- 40% L&T (₹10K) - Accumulation zone
- 30% HDFC MF (₹7.5K) - Diversification
- 20% Parag Parikh (₹5K) - Quality MF
- 10% Cash (₹2.5K) - Wait for opportunities
```

**4. WhatsApp Alerts**
```
📊 Weekly Summary - Fri 6 PM
"Portfolio up 2.3% this week. No action needed.
L&T dipped 4% - good accumulation opportunity.
YES Bank still needs exit review. 💪"
```

**5. Ask AI Anything**
```
You: "Should I buy more Polycab?"
AI: "No. Already at premium valuation (PE 54).
Current price too high for new entry.
Wait for 5-10% correction or add to L&T instead."
```

## How It Works

### Daily Flow
```
Morning:
  - Market opens, NSE/BSE data fetched
  - AI scans for material events
  - Only alerts if something matters

Weekly (Sunday 9 AM):
  - Portfolio health score calculated
  - Sector allocation analyzed
  - WhatsApp summary sent

Monthly (1st of month):
  - Capital allocation plan generated
  - Conviction levels reviewed
  - Next month's strategy sent
```

### Your Questions → Claude → Answers
```
Question: "Is my portfolio too concentrated?"

Claude Analysis:
├─→ Fetches all your holdings
├─→ Calculates Herfindahl index
├─→ Compares to benchmarks
├─→ Checks top 5 (45% = acceptable)
├─→ Reviews sector weights
└─→ Recommends: "Good diversification overall.
                 Only ICICI overweight (+4%).
                 Consider trimming 25%."
```

## Tech Stack (Why These?)

| Component | Choice | Why |
|-----------|--------|-----|
| Frontend | Next.js 14 | Fast, SSR, API routes, PWA ready |
| Database | Supabase | Free tier, real-time, RLS security |
| AI | Claude API | Best analysis for Indian markets |
| Notifications | Twilio | WhatsApp integration |
| Deploy | Vercel | Next.js optimized, auto-scaling |
| Styling | Tailwind | Dark theme, responsive, beautiful |

## Before You Deploy

### 1. Verify Dependencies
```bash
# Check Node version (need 18+)
node --version

# Install all packages
npm install

# Test build
npm run build
```

### 2. Test Locally
```bash
npm run dev
# Visit http://localhost:3000
```

Test each section:
- [ ] Dashboard loads (takes ~2 sec)
- [ ] Click on "AI Insights" tab
- [ ] Click "Ask Your Wealth Manager"
- [ ] Type: "What's my portfolio health?"
- [ ] Should get Claude's response

### 3. Check Environment
```bash
# Verify .env.local exists and has:
CLAUDE_API_KEY=sk-ant-xxx
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 4. Prepare for Production
```bash
# Build for production
npm run build

# Start production server
npm start

# Visit http://localhost:3000
# Verify works same as dev mode
```

## Deployment Checklist

- [ ] Supabase project created and database populated
- [ ] Claude API key obtained
- [ ] Environment variables configured in Vercel
- [ ] App deployed to Vercel (`vercel --prod`)
- [ ] PWA installs on mobile (test on iPhone + Android)
- [ ] AI chat works (ask a question)
- [ ] Portfolio data loads (check Holdings tab)
- [ ] WhatsApp numbers configured (optional)

## After Deployment

### Week 1: Verify Everything
- Add latest holdings if data has changed
- Test WhatsApp alerts (send test message)
- Review AI insights accuracy
- Adjust conviction levels for your holdings

### Week 2: Setup Automations
- Schedule daily market scans
- Setup weekly WhatsApp summaries
- Configure monthly allocation reviews
- Setup sell alerts for your watchlist

### Week 3+: Ongoing Use
- Check app 2-3x per week
- Review AI recommendations
- Update holdings monthly
- Execute monthly capital allocations

## Common Questions

**Q: Will this sell my stocks automatically?**  
A: No. It only recommends. YOU control buy/sell decisions.

**Q: Do you store my data?**  
A: Only you (in Supabase you control). Zero vendor lock-in.

**Q: What if I want more stocks analyzed?**  
A: Add them to Supabase `stock_holdings` table. AI will analyze.

**Q: Can I use this for family members?**  
A: Yes! Add multiple `family_members`. Separate portfolios.

**Q: What happens if Claude API fails?**  
A: Uses cached insights. You still get portfolio data.

**Q: Can I integrate with my broker?**  
A: Not yet, but planned. Currently manual upload via CSV.

## Monthly Costs (Estimate)

| Service | Free? | If Paid |
|---------|-------|---------|
| **Claude API** | ✓ (included) | ₹50-200/month |
| **Supabase** | ✓ Free tier | ₹1,000+/month |
| **Vercel** | ✓ Free tier | ₹2,000+/month |
| **Twilio** | ✓ $15 trial | ₹500-1000/month |
| **Total** | **₹0** | **₹1,550-3,200** |

Perfect for personal use. Free tier handles 1-2 users easily.

## Need Help?

**Claude API Issues:** https://docs.anthropic.com

**Database Setup:** https://supabase.com/docs

**Deployment:** https://vercel.com/docs

**WhatsApp Alerts:** https://www.twilio.com/docs/whatsapp

## Next Steps

1. **Right Now:** Setup Supabase + Vercel (15 mins)
2. **Today:** Deploy app + test locally
3. **This Week:** Add latest portfolio data
4. **Next Week:** Configure WhatsApp alerts
5. **Ongoing:** Use for investment decisions

## Pro Tips

- Ask Claude anything: "Should I retire at 55?" "Best time to add to L&T?"
- Check health score every Sunday (built-in reminder)
- Review capital allocation before each monthly deployment
- Trust the AI but always do your own research
- Backup your portfolio data (export from Supabase monthly)

---

**You're all set! 🚀**

Your Personal AI Wealth Manager is ready to help you make smarter investment decisions.

*"Do I need to do anything today? No? Then relax. Nothing requires your attention."*

— Your Wealth Manager Philosophy
