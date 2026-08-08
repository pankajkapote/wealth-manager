# API Reference & Response Examples

## 📡 Claude AI Chat API

### Request Format
```json
{
  "message": "Should I sell YES Bank?",
  "context": {
    "portfolio": {
      "totalValue": 62500000,
      "totalInvested": 47300000,
      "holdings": 33
    },
    "recentInsights": [
      {
        "title": "YES Bank: Review Exit Position",
        "description": "Down 92% from cost",
        "type": "SELL_ALERT"
      }
    ]
  }
}
```

### Response Format
```json
{
  "response": "YES Bank is a clear exit candidate.\n\nCurrent: ₹22.94 (down 92% from ₹301)\nYour Loss: ₹168,281\n\nRecommendation: REDUCE by 50% immediately.\nExit remaining on any 10% bounce.\n\nConfidence: 95%",
  "timestamp": "2026-07-28T18:30:00Z"
}
```

### Example: Ask About Portfolio Health
```
REQUEST:
{
  "message": "What's my portfolio health?",
  "context": { ... }
}

RESPONSE:
{
  "response": "Your portfolio health is EXCELLENT (8.2/10).\n\n✓ Strengths:\n  • Well-balanced across 5 sectors\n  • Strong performance in quality stocks (Polycab +377%, Dixon +365%)\n  • Good MF diversification\n  • Unrealized gains: +32.2%\n\n⚠ Areas to monitor:\n  • Exit YES Bank (down 92%)\n  • Review Prince Pipes (-62%)\n  • ICICI Bank overweight (14% vs 10% target)\n\nOverall verdict: Healthy portfolio. No urgent action this week.",
  "timestamp": "2026-07-28T18:35:00Z"
}
```

### Example: Ask About Opportunity
```
REQUEST:
{
  "message": "Is L&T a good buy at current price?"
}

RESPONSE:
{
  "response": "YES. L&T is in a good accumulation zone.\n\nValuation Analysis:\n  Current PE: 22\n  Historical Avg: 28 (+27% premium when expensive)\n  Current: 20% DISCOUNT vs historical\n\nFundamentals:\n  ✓ Strong order book (₹4L+ for next 3 years)\n  ✓ Dividend yield: 2.5% (stable)\n  ✓ Earnings resilient (COVID-proof business)\n\nYour Position: Currently 4% (target: 8%)\n\nRecommendation:\n  ADD ₹2-3L over 4-6 months\n  Method: ₹500-750K per month\n  Timing: Monthly on each dip\n\nConfidence: 88%",
  "timestamp": "2026-07-28T18:40:00Z"
}
```

## 📊 Portfolio Data API

### GET /api/portfolio
Returns complete portfolio snapshot

**Response:**
```json
{
  "totalValue": 62500000,
  "totalInvested": 47300000,
  "totalGains": 15200000,
  "gainPercentage": 32.2,
  "healthScore": 8.2,
  "holdings": {
    "stocks": 30,
    "mutualFunds": 3,
    "other": 0,
    "total": 33
  },
  "topGainers": [
    {
      "symbol": "POLYCAB",
      "name": "Polycab India Limited",
      "owner": "Manjiri",
      "value": 720800,
      "gain": 569876,
      "gainPercent": 377.59
    },
    {
      "symbol": "DIXTEC",
      "name": "Dixon Technologies",
      "owner": "Pankaj",
      "value": 828600,
      "gain": 650647,
      "gainPercent": 365.63
    }
  ],
  "sectorAllocation": {
    "Banking & Finance": 35,
    "Industrial": 28,
    "Consumer": 18,
    "Technology": 14,
    "Energy": 5
  },
  "lastUpdated": "2026-07-28T18:00:00Z"
}
```

### GET /api/holdings?type=stocks
Returns detailed stock holdings

**Response:**
```json
{
  "holdings": [
    {
      "id": 1,
      "symbol": "POLYCAB",
      "name": "Polycab India Limited",
      "owner": "Manjiri",
      "isin": "INE042I01038",
      "quantity": 80,
      "avgCostPrice": 1886.55,
      "currentPrice": 9010,
      "valueAtCost": 150924,
      "valueAtMarket": 720800,
      "unrealizedGain": 569876,
      "unrealizedGainPercent": 377.59,
      "rating": "strong_hold",
      "convictionLevel": "high",
      "exitTarget": 12500,
      "stopLoss": 7500,
      "lastReviewed": "2026-07-28T00:00:00Z"
    },
    // ... more holdings
  ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "total": 30,
    "totalPages": 1
  }
}
```

### GET /api/holdings?type=mf
Returns mutual fund holdings

**Response:**
```json
{
  "holdings": [
    {
      "id": 1,
      "fundName": "HDFC Flexicap Growth Direct",
      "fundType": "equity",
      "isin": "INF740K01SL7",
      "units": 97.275,
      "nav": 2232.419,
      "currentNav": 2232.419,
      "costValue": 199990,
      "currentValue": 217017,
      "investmentDate": "2026-03-19",
      "goal": "long_term_wealth",
      "rating": "buy",
      "lastReviewed": "2026-07-28T00:00:00Z"
    },
    // ... more MFs
  ]
}
```

## 💡 AI Insights API

### GET /api/ai-insights
Returns pre-generated insights

**Response:**
```json
{
  "insights": [
    {
      "id": "yes-bank-001",
      "type": "SELL_ALERT",
      "title": "YES Bank: Review Exit Position",
      "description": "Down 92% from cost. Consider further reduction.",
      "symbol": "YESBAN",
      "holding": {
        "qty": 605,
        "costPrice": 301.09,
        "currentPrice": 22.94,
        "loss": -168280
      },
      "reasoning": [
        "Stock down 92% from cost (₹301 to ₹22.94)",
        "Negative momentum for 18+ months",
        "Better opportunities in ICICI Bank and Hcl Finance",
        "Psychological weight outweighs potential upside"
      ],
      "recommendation": "Reduce by 50% immediately. Exit remaining on any bounce.",
      "confidenceScore": 0.95,
      "actionRequired": true,
      "priority": "high",
      "createdAt": "2026-07-28T12:00:00Z",
      "expiresAt": "2026-08-04T12:00:00Z"
    },
    // ... more insights (4 more in sample)
  ],
  "count": 5,
  "lastGenerated": "2026-07-28T12:00:00Z"
}
```

## 📈 Capital Allocation API

### GET /api/capital-allocation?month=2026-02
Returns allocation plan for month

**Response:**
```json
{
  "month": "2026-02-01",
  "totalAmount": 25000,
  "reasoning": "Focus on quality large-caps in accumulation zone. Reduce small-cap exposure gradually.",
  "allocations": [
    {
      "type": "stock",
      "name": "L&T Limited",
      "symbol": "LT",
      "amount": 10000,
      "percentage": 40,
      "reasoning": "PE = 22, near 5-year low. Strong order book. Conviction: HIGH",
      "priority": "high",
      "targetPrice": null,
      "timeline": "4-6 months"
    },
    {
      "type": "mf",
      "name": "HDFC Flexicap Growth Direct",
      "symbol": "HDFC_FC",
      "amount": 7500,
      "percentage": 30,
      "reasoning": "Underweight in large-cap value. Professional management.",
      "priority": "medium",
      "targetPrice": null,
      "timeline": "Ongoing SIP"
    },
    {
      "type": "mf",
      "name": "Parag Parikh Flexi Cap Growth",
      "symbol": "PP_FC",
      "amount": 5000,
      "percentage": 20,
      "reasoning": "Maintain SIP continuity. Good expense ratio.",
      "priority": "medium",
      "targetPrice": null,
      "timeline": "Ongoing SIP"
    },
    {
      "type": "cash",
      "name": "Cash Reserve",
      "symbol": "CASH",
      "amount": 2500,
      "percentage": 10,
      "reasoning": "Market volatility expected. Wait for better opportunities.",
      "priority": "low",
      "targetPrice": null,
      "timeline": "On demand"
    }
  ],
  "expectedOutcome": "Balanced growth with 40% focus on quality large-caps, 50% in MF for professional management, 10% for flexibility.",
  "createdAt": "2026-07-01T00:00:00Z",
  "status": "planned"
}
```

## 🔔 WhatsApp Notification API

### POST /api/whatsapp-notify
Sends WhatsApp messages

**Request:**
```json
{
  "type": "weekly_summary",
  "title": "Weekly Portfolio Summary",
  "message": "📊 Portfolio Update...",
  "priority": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "recipient": "whatsapp:+919876543210",
      "status": "sent",
      "message": "📊 Weekly Portfolio Summary - July 28, 2026\n\n📈 Portfolio Value: ₹62.5L (+2.3%)\n💰 Unrealized Gains: ₹15.2L\n\n✅ Good News:\n• Polycab up 4%\n• ICICI steady\n\n⚠️ Action Items:\n• Review YES Bank\n• Consider L&T accumulation",
      "timestamp": "2026-07-28T18:00:00Z",
      "twilio_sid": "SM1234567890abcdef"
    }
  ]
}
```

## 📊 Portfolio Health Score API

### GET /api/portfolio-health
Returns health metrics

**Response:**
```json
{
  "score": 8.2,
  "maxScore": 10,
  "grade": "Excellent",
  "metrics": {
    "concentrationRisk": {
      "score": 7.5,
      "status": "good",
      "description": "Top 5 holdings = 45% of portfolio. Acceptable for growth investor.",
      "value": "45%",
      "benchmark": "50%"
    },
    "diversification": {
      "score": 8.0,
      "status": "excellent",
      "description": "Well diversified across 30+ stocks and 3 MF schemes.",
      "holdings": 33,
      "sectors": 5
    },
    "valuationHealth": {
      "score": 7.8,
      "status": "good",
      "description": "Portfolio PE = 42 vs market 22. Growth premium justified.",
      "portfolioPE": 42,
      "marketPE": 22,
      "deviationPercent": 91
    },
    "debtHealth": {
      "score": 9.0,
      "status": "excellent",
      "description": "No debt investments. Equity-only strategy.",
      "debtExposure": 0,
      "debtPercent": "0%"
    },
    "incomeStability": {
      "score": 8.5,
      "status": "excellent",
      "description": "Good mix of dividend & growth stocks.",
      "expectedDividendYield": 2.1,
      "dividendPayers": 18
    },
    "riskAdjustment": {
      "score": 8.1,
      "status": "good",
      "description": "Moderate risk profile. Aligned with 20+ year horizon.",
      "timeHorizonYears": 25,
      "riskRating": "moderate"
    }
  },
  "strengths": [
    "Well-balanced portfolio across sectors",
    "Strong performance in quality stocks",
    "Good inclusion of MF for diversification",
    "Healthy unrealized gains (+32%)"
  ],
  "recommendations": [
    "Exit YES Bank loss position",
    "Reduce Prince Pipes by 75%",
    "Trim ICICI Bank overweight position",
    "Continue L&T accumulation"
  ],
  "calculatedAt": "2026-07-28T18:00:00Z"
}
```

## 💾 Database Query Examples

### Get All Holdings for User
```sql
SELECT 
  sh.id,
  sh.symbol,
  sh.company_name,
  sh.quantity,
  sh.avg_cost_price,
  sh.current_price,
  sh.unrealized_gain_loss,
  sh.unrealized_gain_loss_pct,
  sh.rating,
  fm.name as owner
FROM stock_holdings sh
JOIN family_members fm ON sh.family_member_id = fm.id
WHERE fm.user_id = auth.uid()
ORDER BY sh.unrealized_gain_loss DESC;
```

### Calculate Portfolio Value
```sql
SELECT 
  SUM(sh.quantity * sh.current_price) as total_value,
  SUM(sh.quantity * sh.avg_cost_price) as total_invested,
  SUM(sh.unrealized_gain_loss) as total_gains,
  ROUND(
    (SUM(sh.unrealized_gain_loss) / SUM(sh.quantity * sh.avg_cost_price) * 100), 2
  ) as gain_percentage
FROM stock_holdings sh
JOIN family_members fm ON sh.family_member_id = fm.id
WHERE fm.user_id = auth.uid();
```

### Get Portfolio Health Metrics
```sql
SELECT 
  fm.id,
  fm.name,
  COUNT(DISTINCT sh.id) as total_holdings,
  COUNT(DISTINCT SUBSTRING(sh.symbol, 1, 1)) as sectors,
  MAX(sh.quantity * sh.current_price) / 
  SUM(sh.quantity * sh.current_price) as concentration,
  ROUND(
    STDDEV(sh.unrealized_gain_loss_pct) / AVG(sh.unrealized_gain_loss_pct), 2
  ) as volatility
FROM stock_holdings sh
JOIN family_members fm ON sh.family_member_id = fm.id
WHERE fm.user_id = auth.uid()
GROUP BY fm.id, fm.name;
```

### Get AI Insights Expiring Soon
```sql
SELECT *
FROM ai_insights
WHERE family_member_id IN (
  SELECT id FROM family_members 
  WHERE user_id = auth.uid()
)
AND expires_at > NOW()
AND expires_at < NOW() + INTERVAL 1 DAY
ORDER BY confidence_score DESC;
```

### Get Monthly Allocation Plan
```sql
SELECT 
  cap.month,
  cap.monthly_investment_amount,
  cap.allocation_json,
  cap.reasoning,
  cap.status
FROM capital_allocation_plans cap
JOIN family_members fm ON cap.family_member_id = fm.id
WHERE fm.user_id = auth.uid()
AND cap.month = DATE_TRUNC('month', CURRENT_DATE)
ORDER BY cap.created_at DESC
LIMIT 1;
```

### Insert New Stock Holding
```sql
INSERT INTO stock_holdings (
  family_member_id,
  symbol,
  company_name,
  quantity,
  avg_cost_price,
  current_price,
  value_at_cost,
  value_at_market,
  unrealized_gain_loss,
  unrealized_gain_loss_pct,
  conviction_level,
  rating
) VALUES (
  $1,  -- family_member_id
  'POLYCAB',  -- symbol
  'Polycab India Limited',  -- company_name
  80,  -- quantity
  1886.55,  -- avg_cost_price
  9010.00,  -- current_price
  150924.14,  -- value_at_cost
  720800.00,  -- value_at_market
  569875.86,  -- unrealized_gain_loss
  377.59,  -- unrealized_gain_loss_pct
  'high',  -- conviction_level
  'strong_hold'  -- rating
);
```

### Update Holding Current Price
```sql
UPDATE stock_holdings
SET 
  current_price = $1,
  value_at_market = quantity * $1,
  unrealized_gain_loss = (quantity * $1) - value_at_cost,
  unrealized_gain_loss_pct = (
    ((quantity * $1) - value_at_cost) / value_at_cost * 100
  ),
  updated_at = NOW()
WHERE symbol = $2
AND family_member_id IN (
  SELECT id FROM family_members 
  WHERE user_id = auth.uid()
);
```

---

## 🔑 Response Codes & Error Handling

```
200 OK - Request successful
201 Created - Resource created
400 Bad Request - Invalid input
401 Unauthorized - Missing auth
403 Forbidden - Access denied (RLS)
404 Not Found - Resource not found
429 Too Many Requests - Rate limited
500 Internal Server Error - Server error
```

### Error Response Format
```json
{
  "error": "Unauthorized",
  "message": "API key invalid or expired",
  "timestamp": "2026-07-28T18:00:00Z"
}
```

---

**All APIs use JSON format and HTTPS. Keep responses under 1MB for optimal performance.**
