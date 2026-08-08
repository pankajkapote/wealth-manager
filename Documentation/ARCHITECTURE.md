# Architecture: Personal AI Wealth Manager

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER DEVICES (PWA)                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Desktop Browser │ iOS Safari │ Android Chrome │ Desktop  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL EDGE NETWORK (CDN)                     │
│                      Next.js 14 App                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  App Router (app/ directory)                             │   │
│  │  - Dashboard Page (/)                                    │   │
│  │  - API Routes (/api/*)                                   │   │
│  │  - Static Assets                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
           ↓                          ↓                      ↓
    ┌──────────────┐        ┌─────────────────┐    ┌──────────────┐
    │ CLAUDE API   │        │ SUPABASE        │    │ TWILIO API   │
    │              │        │ (PostgreSQL)    │    │              │
    │ • Chat/Sync  │        │ • Holdings DB   │    │ • WhatsApp   │
    │ • Insights   │        │ • RLS Security  │    │ • SMS        │
    │ • Analysis   │        │ • Real-time sub │    │ • Voice      │
    └──────────────┘        └─────────────────┘    └──────────────┘
```

## Technology Stack

### Frontend (Client-Side)
```
React 18.2
├── Next.js 14 (App Router)
├── TypeScript
├── Tailwind CSS
├── Framer Motion (animations)
├── Recharts (data visualization)
├── Lucide Icons
└── PWA (service workers)
```

**Key Libraries:**
- `next-pwa` - Progressive Web App support
- `@supabase/supabase-js` - Database client
- `axios` - HTTP requests
- `zustand` (optional) - State management

### Backend (Server-Side)
```
Next.js 14 API Routes
├── Claude API Integration
├── Supabase PostgreSQL Client
├── Twilio SDK
└── Scheduled Tasks (Vercel Cron)
```

### Infrastructure
```
Vercel (Deployment)
├── Edge Functions (globally distributed)
├── Serverless Functions (API routes)
├── Automatic scaling
└── Environment variables

Supabase (Database)
├── PostgreSQL 14
├── Real-time subscriptions
├── Row-Level Security (RLS)
├── Auth (optional)
└── Storage (optional)
```

### External APIs
1. **Claude API** - AI insights & recommendations
2. **Supabase API** - Database operations
3. **Twilio API** - WhatsApp notifications
4. **NSE/BSE APIs** (future) - Market data

## Data Flow Architecture

### 1. Portfolio Data Loading

```
User Opens App
    ↓
Service Worker checks cache
    ↓
Load from cache (offline mode)
    ↓
Fetch fresh data from Supabase
    ├─→ GET /api/portfolio
    │   └─→ SELECT * FROM stock_holdings WHERE family_member_id = ?
    │
    ├─→ GET /api/mf-holdings
    │   └─→ SELECT * FROM mf_holdings WHERE family_member_id = ?
    │
    └─→ GET /api/portfolio-snapshot
        └─→ SELECT * FROM portfolio_snapshots (latest)
    ↓
Update UI with fresh data
    ↓
Store in localStorage + cache
```

### 2. AI Insight Generation

```
User Views "AI Insights" Tab
    ↓
Load pre-generated insights from Supabase
    ├─→ SELECT * FROM ai_insights 
    │   WHERE family_member_id = ? 
    │   AND expires_at > NOW()
    ↓
User Asks Question (e.g., "Should I sell YES Bank?")
    ↓
POST /api/ai-chat
    ├─→ Build system prompt with portfolio context
    │   (holdings, goals, investment philosophy)
    │
    ├─→ Call Claude API
    │   model: claude-opus-4-1
    │   max_tokens: 500
    │
    ├─→ Claude analyzes:
    │   • YES Bank metrics
    │   • Loss position (down 92%)
    │   • Opportunity cost
    │   • Portfolio impact
    │   • Alternative options
    │
    └─→ Return recommendation to user
    ↓
Display response in chat interface
    ↓
Optional: Save insight to database
```

### 3. WhatsApp Notification Flow

```
Sell Alert Triggered
├─→ Confidence score > 0.8
└─→ Action required = TRUE
    ↓
Scheduled Task (Daily 8 AM)
    ↓
POST /api/whatsapp-notify
    ├─→ Verify Twilio credentials
    │
    ├─→ Format message
    │   ⚠️ YES Bank: Exit Position
    │   Down 92% from cost
    │   Recommendation: Reduce 50%
    │
    ├─→ For each recipient:
    │   client.messages.create({
    │     from: "whatsapp:+14155238886",
    │     to: "whatsapp:+919876543210",
    │     body: formatted_message
    │   })
    │
    ├─→ Log delivery status
    │   INSERT INTO whatsapp_logs
    │
    └─→ Return results
```

### 4. Capital Allocation Recommendation

```
User Opens "Capital Allocator"
    ↓
GET /api/capital-allocation?month=2026-02
    ↓
Algorithm analyzes:
├─→ Current portfolio weights
├─→ Target allocation (10% L&T, 12% ICICI, etc.)
├─→ Valuation metrics (PE, dividend yield)
├─→ Sector performance
├─→ Market outlook
└─→ Risk/return profile
    ↓
Generate allocation plan:
├─→ 40% L&T (accumulation zone)
├─→ 30% HDFC MF (diversification)
├─→ 20% Parag Parikh MF (quality)
└─→ 10% Cash (opportunities)
    ↓
Display with:
├─→ Visual breakdown (pie chart)
├─→ Rationale for each holding
├─→ Monthly implementation steps
└─→ Expected outcome
```

## Database Schema Details

### Core Tables

**family_members**
```sql
id: SERIAL PRIMARY KEY
user_id: UUID (from auth)
name: VARCHAR(255)
email: VARCHAR(255)
phone: VARCHAR(20)
role: 'owner' | 'spouse' | 'dependent'
created_at: TIMESTAMP
```

**stock_holdings**
```sql
id: SERIAL PRIMARY KEY
family_member_id: INT (FK)
symbol: VARCHAR(20)
company_name: VARCHAR(255)
quantity: INT
avg_cost_price: DECIMAL(10,2)
current_price: DECIMAL(10,2)  -- Updated daily
value_at_market: DECIMAL(12,2)  -- qty * current_price
unrealized_gain_loss: DECIMAL(12,2)  -- calculated
conviction_level: 'high' | 'medium' | 'low'
buy_reason: TEXT
exit_target: DECIMAL(10,2)
stop_loss: DECIMAL(10,2)
rating: 'strong_buy' | 'buy' | 'hold' | 'reduce' | 'sell'
last_reviewed: TIMESTAMP
```

**ai_insights**
```sql
id: SERIAL PRIMARY KEY
family_member_id: INT (FK)
insight_type: 'portfolio_health' | 'sell_alert' | 'opportunity' | ...
symbol: VARCHAR(20)  -- Which stock (if applicable)
title: VARCHAR(255)
description: TEXT
recommendation: VARCHAR(500)
confidence_score: DECIMAL(3,2)  -- 0.0 to 1.0
action_required: BOOLEAN
read: BOOLEAN
created_at: TIMESTAMP
expires_at: TIMESTAMP  -- Insights expire after 7 days
```

**capital_allocation_plans**
```sql
id: SERIAL PRIMARY KEY
family_member_id: INT (FK)
month: DATE  -- 2026-02-01
monthly_investment_amount: DECIMAL(10,2)
allocation_json: JSONB  -- { "LT": 10000, "MF": 7500, ... }
reasoning: TEXT
status: 'planned' | 'in_progress' | 'completed'
```

**portfolio_snapshots**
```sql
id: SERIAL PRIMARY KEY
family_member_id: INT (FK)
total_value: DECIMAL(12,2)
total_invested: DECIMAL(12,2)
total_gain_loss: DECIMAL(12,2)
gain_loss_percentage: DECIMAL(5,2)
health_score: DECIMAL(3,1)  -- 1 to 10
allocation_json: JSONB  -- Sector-wise, asset-class-wise
snapshot_date: DATE
created_at: TIMESTAMP
```

## API Endpoints

### Portfolio Data
```
GET /api/portfolio
- Returns: complete portfolio summary
- Cache: 1 hour
- Format: { totalValue, totalInvested, gains, holdings_count }

GET /api/holdings?type=stocks|mf|all
- Returns: detailed holdings list
- Pagination: 50 per page
- Filter: family_member_id

POST /api/holdings
- Input: { symbol, qty, cost_price, ... }
- Creates new holding
- Auth: Required
```

### AI Endpoints
```
POST /api/ai-chat
- Input: { message, context }
- Returns: { response, timestamp }
- Rate limit: 50 req/min per user
- Model: claude-opus-4-1

GET /api/ai-insights
- Returns: latest AI-generated insights
- Filter: type, priority, expires_at
- Format: [{ id, title, recommendation, confidence }]

POST /api/ai-insights/generate
- Triggers: refresh insight generation
- Auth: Backend only
- Async: Returns job_id
```

### Notifications
```
POST /api/whatsapp-notify
- Input: { type, title, message, priority }
- Returns: { success, results[] }
- Recipients: from env WHATSAPP_RECIPIENTS

GET /api/whatsapp-logs
- Returns: delivery history
- Filter: date_range, status, type
```

### Portfolio Analysis
```
GET /api/portfolio-health
- Returns: { score, metrics, grade }
- Metrics: concentration, diversification, valuation, etc.

GET /api/capital-allocation?month=2026-02
- Returns: allocation plan for month
- Algorithm: ML-based optimization

POST /api/portfolio-update
- Upload: CSV/Excel file
- Parses: Holdings data
- Updates: All holdings for member
```

## State Management

### Frontend State (React)

```typescript
// Dashboard state
interface DashboardState {
  selectedView: string;
  mobileMenuOpen: boolean;
  loading: boolean;
}

// Portfolio state
interface PortfolioState {
  holdings: StockHolding[];
  portfolio: Portfolio;
  metadata: PortfolioMetadata;
  lastUpdated: Date;
}

// Insights state
interface InsightsState {
  insights: AIInsight[];
  selectedInsight: string | null;
  chatHistory: ChatMessage[];
}
```

### Server State (Database)

All state is persisted in Supabase PostgreSQL:
- No in-memory state (scales horizontally)
- RLS policies ensure user isolation
- Automatic backups (daily)
- Point-in-time recovery available

## Security Model

### Authentication (Optional)
```
Supabase Auth (email/password, OAuth)
├─→ Issues JWT token
├─→ RLS policies use auth.uid()
└─→ Tokens refresh automatically
```

### Row-Level Security (RLS)
```sql
-- Only users can see their own data
CREATE POLICY "Users see their holdings"
  ON stock_holdings
  FOR SELECT
  USING (
    family_member_id IN (
      SELECT id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );
```

### Data Protection
```
• Supabase encrypts data in transit (TLS)
• Database encrypted at rest
• API keys stored in environment (not in code)
• Sensitive data never logged
• CORS enabled only for your domain
```

### Private Key Management
```bash
# .env.local (NEVER commit this)
CLAUDE_API_KEY=sk-ant-xxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxx

# Vercel dashboard (encrypted)
- Environment variables stored securely
- Accessible only to deployment
- Rotatable anytime
```

## Performance Optimization

### Frontend
```
Code Splitting:
- Dynamic imports for heavy components
- Route-based code splitting (automatic in Next.js)
- Component lazy loading

Image Optimization:
- next/image component
- Automatic WebP conversion
- Responsive images

Caching:
- Service Worker caching (PWA)
- Browser cache headers
- Supabase client caching
```

### Backend
```
Database:
- Indexes on frequently queried columns
- Connection pooling (Vercel)
- Query optimization

API:
- Response compression (gzip)
- CDN caching for static assets
- Rate limiting (to prevent abuse)
```

### Monitoring
```
Vercel Analytics:
- Page performance metrics
- Web Vitals (LCP, FID, CLS)
- Error tracking

Sentry (optional):
- Error reporting
- Performance monitoring
- Release tracking
```

## Deployment Pipeline

```
Local Development
    ↓ git push to GitHub
↓
GitHub Webhook
    ↓
Vercel CI/CD
├─→ Install dependencies
├─→ Run TypeScript checks
├─→ Build (npm run build)
├─→ Test (optional)
└─→ Deploy to edge network
    ↓
Environment Variables Applied
    ↓
Live at: https://wealth-manager.vercel.app
```

## Scalability Considerations

### Current Load Capacity
- **Concurrent Users:** ~1000 (Vercel)
- **API Requests/sec:** ~100 (free tier)
- **Database Connections:** ~50 (Supabase)
- **Storage:** 500 MB (Supabase free)

### Scaling Path
```
Phase 1 (Current): Single user + family
Phase 2: Multi-user SaaS mode
  └─→ Add auth (Supabase Auth)
  └─→ Upgrade database (Pro tier)
  └─→ Implement multi-tenancy

Phase 3: High-volume
  └─→ Add Redis cache
  └─→ Database replication
  └─→ Dedicated Vercel plan
  └─→ Market data streaming
```

## Future Enhancements

### Planned Features
1. **Real-time Market Data**
   - NSE API integration
   - Live price updates via WebSocket
   - Intraday charts

2. **Advanced Analytics**
   - Technical analysis indicators
   - Volatility metrics
   - Correlation analysis

3. **Goal-Based Tracking**
   - Retirement calculator
   - College fund planner
   - Goal progress tracking

4. **Broker Integration**
   - Direct trading (NEST, SHOONYA)
   - Trade execution
   - Settlement tracking

5. **Mobile App**
   - React Native version
   - Push notifications
   - Biometric auth

## Monitoring & Alerts

```
Vercel Analytics Dashboard:
- Page performance
- API response times
- Error rates

Custom Monitoring:
- Portfolio health alerts
- API error tracking
- Database query performance
```

---

**This architecture is designed for:**
- ✅ Privacy (your data, your control)
- ✅ Scalability (starts small, grows with you)
- ✅ Performance (edge network, caching)
- ✅ Reliability (99.9% uptime SLA)
- ✅ Cost-Effective (free tiers where possible)
