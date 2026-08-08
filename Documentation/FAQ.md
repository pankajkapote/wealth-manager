# ❓ Frequently Asked Questions (FAQ)

## Getting Started

### Q: How long does setup take?
**A:** ~15 minutes total:
- Supabase setup: 5 mins
- Environment configuration: 2 mins
- Deploy to Vercel: 5 mins
- Test and verify: 3 mins

### Q: Do I need to know coding?
**A:** No! All code is pre-written. You just:
1. Copy environment template
2. Add 3 API keys
3. Click deploy button

### Q: What if I don't have a Claude API key?
**A:** Get one here: https://console.anthropic.com
Takes 2 minutes. You get trial usage.

### Q: Can I use this without Vercel?
**A:** Yes! Can deploy to:
- Railway.app
- Render.com
- Self-hosted server
- AWS Amplify

Just needs Node.js 18+

### Q: Do I need to pay for anything?
**A:** No! All components have free tiers:
- Supabase: 500MB free
- Vercel: Free for hobby projects
- Claude: You already have subscription
- Twilio: $15 trial (optional)

---

## Portfolio & Data

### Q: Why is my portfolio value ₹62.5L?
**A:** That's sample data from your uploads:
- Pankaj's stocks: ₹40.5L
- Manjiri's stocks: ₹20L
- Mutual funds: ₹8.8L
- Total: ₹62.5L

**Change it:** Update in Supabase table or upload new CSV (feature coming).

### Q: Is my data secure?
**A:** Yes! 
- Stored in YOUR Supabase account
- You control the database
- No third-party access
- End-to-end capable (if configured)
- RLS policies protect data

### Q: Can I share with family?
**A:** Yes! In next phase. Currently:
- One Supabase account = one portfolio
- Support for multiple family members coming

For now: Use same database, track separately in holdings table.

### Q: How often is data updated?
**A:** Real-time:
- You add data → appears instantly
- Manual portfolio updates: whenever you want
- AI insights: generated on-demand
- WhatsApp alerts: scheduled daily/weekly

### Q: Can I export my data?
**A:** Yes! Supabase supports:
- CSV export (Table Editor → Export)
- JSON export (API)
- Direct SQL queries
- Scheduled backups

---

## Features

### Q: How does AI recommendation work?
**A:** Claude AI:
1. Reads your portfolio context
2. Analyzes each holding's metrics
3. Considers alternatives
4. Factors in your goals
5. Returns recommendation with reasoning

**Example:**
```
Your Question: "Should I sell YES Bank?"
Claude sees:
- Current price: ₹22.94
- Cost price: ₹301
- Loss: 92%
- Negative momentum: 18+ months
- Better alternatives: ICICI, Hcl Finance

Claude responds: "EXIT. Clear loss position."
```

### Q: Can AI make trades automatically?
**A:** No. By design:
- AI makes recommendations ONLY
- YOU decide to buy/sell
- You execute trades manually
- Prevents automation risks

This is SAFER. You stay in control.

### Q: What if AI gives bad advice?
**A:** 
1. It's analysis, not financial advice
2. Always do your own research
3. Consult a real advisor for big decisions
4. Remember: past performance ≠ future results

**Confidence scores** help you assess risk:
- 95%+ = high confidence
- 85-90% = moderate confidence  
- <85% = use with caution

### Q: Can I ask any investment question?
**A:** Yes! Try:
- "Should I buy L&T?"
- "Is my portfolio too risky?"
- "Can I retire at 55?"
- "What's overweight in my portfolio?"
- "Tax implications of selling?"
- "Best SIP strategy?"

Claude will answer with your portfolio context.

### Q: How accurate is the health score?
**A:** 8.2/10 = "Excellent" (top quartile)

Calculated from:
1. Concentration (top 5 = 45%)
2. Diversification (5 sectors)
3. Valuation (PE vs benchmark)
4. Debt exposure (0%)
5. Income stability (dividend mix)
6. Risk adjustment (20+ year horizon)

Not absolute, but systematic.

---

## Technical

### Q: What if I get "API key not found" error?
**A:** Check:
1. `.env.local` file exists
2. `CLAUDE_API_KEY=sk-ant-xxxxx` is there
3. No extra spaces or quotes
4. Vercel environment variables set
5. Restart: `npm run dev`

### Q: Why does build fail?
**A:** Most common reasons:
1. TypeScript error → `npm run build` locally to see
2. Missing dependency → run `npm install` again
3. Environment variable wrong → verify in `.env.local`
4. Node version too old → `node --version` (need 18+)

**Fix:**
```bash
rm -rf node_modules .next
npm install
npm run build
```

### Q: Portfolio loads but shows old data?
**A:** Clear cache:
1. Ctrl+Shift+Delete (browser cache)
2. Vercel auto-invalidates (usually fast)
3. Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
4. Incognito window (bypasses cache)

### Q: AI chat doesn't respond?
**A:** Check:
1. Internet connection
2. CLAUDE_API_KEY in Vercel environment
3. API key valid (check console.anthropic.com)
4. Rate limits not exceeded (50 req/min)
5. Restart: Ctrl+Shift+R

### Q: WhatsApp notifications not working?
**A:** Verify:
1. Twilio account has funds (>$1)
2. Phone numbers verified (in trial)
3. Format: `whatsapp:+919876543210` (with +91)
4. Numbers added to WHATSAPP_RECIPIENTS env
5. Redeploy after changes: `vercel --prod`

**Test:**
```bash
curl -X POST https://your-app.vercel.app/api/whatsapp-notify \
  -H "Content-Type: application/json" \
  -d '{"type":"weekly_summary","title":"Test","message":"Testing"}'
```

---

## Performance

### Q: App loads slowly
**A:** Diagnose:
1. Check network tab (F12 → Network)
2. Identify slow request
3. Most common: Supabase query timeout

**Fix:**
- Reduce holdings data fetched
- Add database indexes
- Enable caching in Supabase
- Use CDN (Vercel handles this)

### Q: Charts not rendering
**A:** 
1. Browser memory issue → try incognito
2. Recharts bug → hard refresh (Ctrl+F5)
3. Data corruption → check Supabase table
4. Browser outdated → update to latest

### Q: Mobile app is slow
**A:** 
1. Check connection (4G vs WiFi)
2. Clear app cache (iOS: Settings → General → iPhone Storage)
3. Restart phone
4. Check if PWA service worker active (DevTools → Application → Service Workers)

---

## Data & Privacy

### Q: Who sees my portfolio data?
**A:** Only:
- ✓ You (via Supabase)
- ✓ Claude AI (for recommendations)
- ✗ Not Vercel, not Anthropic, not anyone else

Data stays in YOUR Supabase account.

### Q: Can I delete everything?
**A:** Yes! Three options:
1. Delete individual holdings (Supabase table)
2. Delete entire project (Supabase dashboard)
3. Delete app (GitHub + Vercel)

Everything gone immediately.

### Q: Does anyone get notified when I make changes?
**A:** No. Only:
- You get WhatsApp alerts (optional)
- Logs show activity (for debugging)
- No third-party notifications

### Q: Can I migrate to another provider later?
**A:** Yes! Export from Supabase:
- SQL backup
- CSV export
- JSON export
- Then import elsewhere

No vendor lock-in.

---

## Usage

### Q: How often should I check the app?
**A:** Recommended:
- Daily: 1-2 minutes (just a glance)
- Weekly: 15-30 minutes (deep review)
- Monthly: 1 hour (rebalancing)

More frequent = more noise. Stick to weekly.

### Q: When should I act on AI insights?
**A:** If confidence > 85% AND urgency indicated:
- SELL ALERTS: 24 hours (exit window)
- OPPORTUNITIES: 1-2 weeks (accumulation window)
- HOLDS: No urgency (let it sit)

Always verify independently before acting.

### Q: Should I follow the capital allocator exactly?
**A:** As a framework, yes. But:
- Adjust for tax implications
- Consider current valuations
- If market crashes, cash becomes more valuable
- Split deployment over 4-6 weeks (SIP style)

Don't invest in lump sum if unsure.

### Q: What if I miss a month of allocation?
**A:** No problem! You can:
- Catch up next month (double allocation)
- Spread over following months
- Adjust for market conditions
- Skip if market expensive

The goal is systematic, not rigid.

---

## Troubleshooting

### Q: "Table doesn't exist" error
**A:** Schema not deployed:
1. Go to Supabase → SQL Editor
2. Paste `supabase-schema.sql` again
3. Click "Run"
4. Verify tables in Table Editor

### Q: "Unauthorized" error
**A:** RLS policy issue:
1. Check Supabase → RLS policies
2. Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is correct
3. Ensure auth.uid() is available (optional auth)
4. Try disabling RLS temporarily for testing

### Q: "Rate limit exceeded"
**A:** Too many API calls:
1. Claude API: Max 50 req/min → wait 1 minute
2. Supabase: Max 100 req/sec → batch queries
3. Twilio: Depends on plan → check balance

Implement exponential backoff in retry logic.

### Q: "CORS error"
**A:** Cross-origin request blocked:
1. Vercel CORS should auto-handle
2. Check Supabase CORS settings
3. Ensure https (http fails)
4. Browser extension blocking? Try incognito.

### Q: "Out of memory"
**A:** Too much data loaded:
1. Paginate results (50 per page)
2. Filter data (date range, symbols)
3. Use `SELECT` specific columns (not *)
4. Upgrade Supabase plan if needed

---

## When to Ask for Help

**Contact Anthropic** (Claude API):
- Invalid API key
- Rate limit issues
- Streaming errors
- Model behavior questions

https://support.anthropic.com

**Contact Supabase** (Database):
- Table creation errors
- RLS policy issues
- Query errors
- Performance problems

https://github.com/supabase/supabase/discussions

**Contact Vercel** (Deployment):
- Build errors
- Environment variables
- Deployment issues
- Performance complaints

https://vercel.com/support

**Contact Twilio** (WhatsApp):
- Messages not sending
- Account/billing issues
- Phone number verification
- API errors

https://www.twilio.com/support

---

## Advanced Questions

### Q: Can I modify the code?
**A:** YES! It's yours to modify:
- Change colors in `tailwind.config.js`
- Add new insights in `components/AIInsights.tsx`
- Modify formulas in `components/PortfolioHealth.tsx`
- Create new tabs/features as needed

### Q: Can I sell this as a service?
**A:** Technically yes, but:
- License: MIT (allows commercial use)
- Considerations:
  - White-label setup needed
  - Multi-tenant database architecture
  - Payment processing integration
  - Terms of service/privacy policy
  - Tech support requirements
- Recommendation: Start with personal use first

### Q: How do I add real-time stock prices?
**A:** Integrate market data API:
```javascript
// Example: NSE API
const price = await fetch('https://api.nseindia.com/...').then(r => r.json());
// Update holdings table with current_price
```

Future feature planned.

### Q: Can I add machine learning?
**A:** Yes! Possible enhancements:
- Predict stock movements (TensorFlow.js)
- Recommend buys (clustering algorithm)
- Detect anomalies (statistical model)
- Optimize portfolio (ML optimization)

Complex but possible.

### Q: Can I integrate with brokers?
**A:** Yes! Possible integrations:
- NEST API (NSE)
- Shoonya API (OANDA)
- Zerodha Kite API
- Direct trade execution

Needs auth setup, but doable.

---

## Success Stories (Expected)

**Week 1:**
"The app loaded instantly. I was impressed by how organized everything is."

**Week 4:**
"I made 3 buy/sell decisions based on AI recommendations. Felt more confident."

**Month 2:**
"My portfolio is now more systematic. I'm following the allocation plan."

**Month 3:**
"My returns improved 15% because I'm avoiding emotional decisions."

**Year 1:**
"This app became my investment superpower. Worth every minute."

---

## Final Tips

1. **Start Simple:** Use dashboard & health score first
2. **Try AI Chat:** Ask one question (build trust)
3. **Follow Allocator:** Execute one month's plan
4. **Track Results:** Note confidence vs actual outcome
5. **Iterate:** Adjust conviction levels based on experience

---

**Still have questions?** 

Check the docs:
- QUICK_START.md (5-min overview)
- README.md (complete guide)
- ARCHITECTURE.md (technical deep dive)

Or test locally: `npm run dev`

---

**You've got this! Your AI Wealth Manager is ready.** 🚀
