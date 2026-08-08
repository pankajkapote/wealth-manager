# Complete Setup Guide: Personal AI Wealth Manager

Follow this step-by-step guide to deploy your wealth manager PWA.

## Step 1: Create Supabase Project (5 mins)

### 1.1 Sign Up
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Create new organization (or use existing)

### 1.2 Create Database Project
1. Name: `wealth-manager`
2. Password: Generate strong password
3. Region: Choose closest to you (India: Singapore/Mumbai)
4. Click "Create new project"
5. Wait 2-3 minutes for setup

### 1.3 Get Credentials
Once project is created:
1. Click on project name
2. Go to Settings → API
3. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon Key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 1.4 Create Database Tables
1. In Supabase dashboard, go to SQL Editor
2. Create new query
3. Paste contents of `supabase-schema.sql`
4. Click "Run" (green play button)
5. Tables created ✓

## Step 2: Get Claude API Key (2 mins)

You already have this! Find it:

1. Go to https://console.anthropic.com
2. Copy your API key
3. Save as `CLAUDE_API_KEY` in `.env.local`

**Note:** This PWA works with your existing Claude subscription. Estimated monthly cost: ₹50-200 depending on usage.

## Step 3: Setup Twilio for WhatsApp (10 mins, optional)

WhatsApp notifications are optional. Skip if you don't want SMS alerts.

### 3.1 Create Twilio Account
1. Go to https://www.twilio.com/try-twilio
2. Sign up with phone verification
3. Verify your phone number
4. Get $15 trial credit

### 3.2 Enable WhatsApp
1. Dashboard → Messaging → Try it out → WhatsApp
2. Accept WhatsApp Business terms
3. You'll get a test number like `+14155238886`
4. This is your `TWILIO_WHATSAPP_SENDER`

### 3.3 Get Credentials
1. Dashboard → Account
2. Copy:
   - Account SID → `TWILIO_ACCOUNT_SID`
   - Auth Token → `TWILIO_AUTH_TOKEN`

### 3.4 Add Recipients
Your WhatsApp numbers to receive alerts:
```
WHATSAPP_RECIPIENTS=whatsapp:+919876543210,whatsapp:+919876543211
```

**Note:** In trial mode, only verified numbers can receive messages.

## Step 4: Setup Environment Variables (3 mins)

```bash
# In project root, create .env.local
cp .env.local.example .env.local
```

Fill in the file:

```env
# REQUIRED: Claude API
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxx

# REQUIRED: Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# OPTIONAL: Twilio WhatsApp
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_WHATSAPP_SENDER=whatsapp:+14155238886
WHATSAPP_RECIPIENTS=whatsapp:+919876543210

# Optional metadata
NEXT_PUBLIC_PORTFOLIO_OWNER=Pankaj Kapote
NEXT_PUBLIC_FAMILY_MEMBERS=Pankaj Kapote,Manjiri Kapote
```

## Step 5: Install & Test Locally (5 mins)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Navigate to: http://localhost:3000

You should see:
- Dashboard with portfolio overview
- Portfolio Health Score (8.2/10)
- Holdings list (30+ stocks)
- AI Insights tab
- Capital Allocator

**Test AI Chat:**
1. Click "AI Insights" tab
2. In "Ask Your Wealth Manager" box
3. Type: "Should I sell YES Bank?"
4. Click Send
5. You should see Claude's response

If it fails: Check `.env.local` for correct API keys

## Step 6: Prepare for Deployment

### 6.1 Fix Imports
Ensure your `app/layout.tsx` has proper imports:

```typescript
import type { Metadata } from 'next';
import './globals.css';
```

### 6.2 Build Locally
```bash
npm run build
```

If there are errors, fix them before deploying.

### 6.3 Test Build
```bash
npm run start
```

Visit http://localhost:3000 again to verify build works.

## Step 7: Deploy to Vercel (3 mins, Recommended)

### 7.1 Setup Vercel
```bash
npm install -g vercel
vercel login
```

### 7.2 Deploy
```bash
vercel
```

During setup:
- Project name: `wealth-manager`
- Framework: Next.js
- Root directory: ./
- Build command: `npm run build`
- Output directory: `.next`

### 7.3 Add Environment Variables
1. After deploy, go to Vercel dashboard
2. Select your project
3. Settings → Environment Variables
4. Add all variables from `.env.local`:
   - CLAUDE_API_KEY
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - TWILIO_ACCOUNT_SID
   - TWILIO_AUTH_TOKEN
   - TWILIO_WHATSAPP_SENDER
   - WHATSAPP_RECIPIENTS

### 7.4 Redeploy
```bash
vercel --prod
```

### 7.5 Get URL
Your app is live at: `https://wealth-manager-xxxxx.vercel.app`

## Step 8: Setup PWA (Mobile Install)

### iOS Installation
1. Open in Safari
2. Tap Share → Add to Home Screen
3. Name: "Wealth Manager"
4. Tap Add
5. Icon appears on home screen

### Android Installation
1. Open in Chrome
2. Tap Menu (⋮) → Install app
3. Tap Install
4. App appears on home screen

### Test PWA Features
1. Go offline
2. App should still work (loads cached data)
3. Try "Add to Home Screen"
4. Should work like native app

## Step 9: Import Your Portfolio Data

Your portfolio data is pre-loaded. To add your latest data:

### Option A: Manual Entry (Next phase)
Upload your latest holdings via CSV/Excel.

### Option B: Direct Database Entry
1. Supabase Dashboard → Table Editor
2. Click `stock_holdings` table
3. Click "Insert Row"
4. Add your holdings

### Sample Data Format:
```sql
INSERT INTO stock_holdings (
  family_member_id, symbol, company_name, qty, avg_cost_price, current_price
) VALUES (
  1, 'POLYCAB', 'Polycab India', 80, 1886.55, 9010.00
);
```

## Step 10: Schedule Automated Tasks (Optional)

To get daily alerts and weekly summaries, setup cron jobs:

### Use Vercel Cron:
Create `app/api/cron/daily-scan/route.ts`:

```typescript
export async function GET(request: Request) {
  // Verify Vercel cron signature
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Your daily scan logic here
  // - Fetch NSE data
  // - Generate insights
  // - Send WhatsApp alerts

  return Response.json({ success: true });
}
```

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/daily-scan",
    "schedule": "0 6 * * *"
  }]
}
```

## Troubleshooting

### Issue: "Claude API key not found"
**Fix:** Check `.env.local` has `CLAUDE_API_KEY` set

### Issue: "Supabase connection failed"
**Fix:** Verify:
- `NEXT_PUBLIC_SUPABASE_URL` is correct
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Supabase project is running (check dashboard)

### Issue: "WhatsApp message failed"
**Fix:**
- Verify phone numbers have `whatsapp:` prefix
- Check Twilio trial funds (at least $1 credit)
- Ensure recipient numbers are in trial verified list

### Issue: PWA won't install
**Fix:**
- Clear browser cache
- Ensure HTTPS is enabled (automatic on Vercel)
- Try in Chrome/Edge/Safari

### Issue: "Build failed on Vercel"
**Fix:**
1. Check build logs (Deployments → Failed build)
2. Fix TypeScript errors
3. Ensure all imports are correct
4. Run `npm run build` locally to verify

## Performance Tips

1. **Enable Caching**
   - Supabase caches queries automatically
   - Use next/image for optimized images

2. **Optimize Database**
   - Add indexes on frequently queried columns
   - Supabase auto-creates indexes for primary keys

3. **Frontend Performance**
   - Use Next.js image optimization
   - Lazy load components (already done)
   - Enable PWA caching

4. **API Rate Limiting**
   - Claude API: 50 requests/minute (free tier)
   - Twilio: Unlimited during trial
   - Supabase: 100 requests/sec (free tier)

## Next Steps After Deployment

1. **Add Your Latest Holdings**
   - Upload CSV from your broker
   - Or manually add in Supabase

2. **Configure WhatsApp Recipients**
   - Add family members' WhatsApp numbers
   - Test with sample alerts

3. **Setup Daily Notifications**
   - Schedule NSE data fetches
   - Configure alert thresholds

4. **Customize Insights**
   - Adjust conviction levels
   - Update goal targets
   - Configure risk preferences

5. **Integrate with Brokers** (Optional)
   - NSE API integration
   - Real-time price feeds
   - Trade execution (advanced)

## Support Resources

**Claude API:**
- Docs: https://docs.anthropic.com
- Community: https://github.com/anthropics

**Supabase:**
- Docs: https://supabase.com/docs
- Community: https://github.com/supabase

**Vercel:**
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

**Twilio:**
- WhatsApp Docs: https://www.twilio.com/docs/whatsapp
- Console: https://console.twilio.com

---

**You're all set!** Your Personal AI Wealth Manager is now live. 🚀
