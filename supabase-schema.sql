-- Wealth Manager Database Schema
-- Copy this entire file to Supabase SQL Editor and run

-- Users/Family Members
CREATE TABLE family_members (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(50), -- owner, spouse, dependent
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Holdings: Stocks
CREATE TABLE stock_holdings (
  id SERIAL PRIMARY KEY,
  family_member_id INT REFERENCES family_members ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  isin_code VARCHAR(20),
  quantity INT NOT NULL,
  avg_cost_price DECIMAL(10,2),
  current_price DECIMAL(10,2),
  value_at_cost DECIMAL(12,2),
  value_at_market DECIMAL(12,2),
  unrealized_gain_loss DECIMAL(12,2),
  unrealized_gain_loss_pct DECIMAL(5,2),
  conviction_level VARCHAR(20), -- high, medium, low
  buy_reason TEXT,
  exit_target DECIMAL(10,2),
  stop_loss DECIMAL(10,2),
  rating VARCHAR(20), -- strong buy, buy, hold, reduce, sell
  last_reviewed TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Holdings: Mutual Funds
CREATE TABLE mf_holdings (
  id SERIAL PRIMARY KEY,
  family_member_id INT REFERENCES family_members ON DELETE CASCADE,
  fund_name VARCHAR(255) NOT NULL,
  fund_type VARCHAR(50), -- equity, debt, hybrid, etc.
  isin_code VARCHAR(20),
  units DECIMAL(10,4),
  nav DECIMAL(10,2),
  current_nav DECIMAL(10,2),
  cost_value DECIMAL(12,2),
  current_value DECIMAL(12,2),
  investment_date DATE,
  goal VARCHAR(100), -- long-term growth, retirement, college, etc.
  rating VARCHAR(20),
  last_reviewed TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Holdings: Other Assets (VPF, NPS, Real Estate, etc.)
CREATE TABLE other_holdings (
  id SERIAL PRIMARY KEY,
  family_member_id INT REFERENCES family_members ON DELETE CASCADE,
  asset_type VARCHAR(50), -- vpf, nps, real_estate, crypto, etc.
  name VARCHAR(255) NOT NULL,
  current_value DECIMAL(12,2),
  purchase_price DECIMAL(12,2),
  purchase_date DATE,
  maturity_date DATE,
  rate_of_return DECIMAL(5,2),
  goal VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Portfolio Goals
CREATE TABLE portfolio_goals (
  id SERIAL PRIMARY KEY,
  family_member_id INT REFERENCES family_members ON DELETE CASCADE,
  goal_name VARCHAR(255) NOT NULL,
  target_amount DECIMAL(12,2),
  current_amount DECIMAL(12,2),
  target_date DATE,
  priority VARCHAR(20), -- critical, high, medium, low
  required_annual_return DECIMAL(5,2),
  status VARCHAR(20), -- on_track, behind, ahead
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Market Data Cache (for daily scans)
CREATE TABLE market_data_cache (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  current_price DECIMAL(10,2),
  pe_ratio DECIMAL(5,2),
  market_cap BIGINT,
  dividend_yield DECIMAL(5,2),
  fifty_two_week_high DECIMAL(10,2),
  fifty_two_week_low DECIMAL(10,2),
  pe_historical_avg DECIMAL(5,2),
  rating VARCHAR(20),
  latest_news TEXT,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(symbol)
);

-- AI Insights & Recommendations
CREATE TABLE ai_insights (
  id SERIAL PRIMARY KEY,
  family_member_id INT REFERENCES family_members ON DELETE CASCADE,
  insight_type VARCHAR(50), -- portfolio_health, sell_alert, opportunity, valuation, etc.
  symbol VARCHAR(20),
  holding_id INT,
  title VARCHAR(255),
  description TEXT,
  recommendation VARCHAR(255),
  confidence_score DECIMAL(3,2),
  action_required BOOLEAN DEFAULT FALSE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Monthly Capital Allocation Plans
CREATE TABLE capital_allocation_plans (
  id SERIAL PRIMARY KEY,
  family_member_id INT REFERENCES family_members ON DELETE CASCADE,
  month DATE NOT NULL,
  monthly_investment_amount DECIMAL(10,2),
  allocation_json JSONB, -- { symbol: amount, fund_name: amount, ... }
  reasoning TEXT,
  status VARCHAR(20), -- planned, in_progress, completed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- WhatsApp Notifications Log
CREATE TABLE whatsapp_logs (
  id SERIAL PRIMARY KEY,
  family_member_id INT REFERENCES family_members ON DELETE CASCADE,
  phone_number VARCHAR(20),
  message_type VARCHAR(50), -- weekly_summary, sell_alert, opportunity, etc.
  message_text TEXT,
  sent_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20), -- sent, failed, pending
  twilio_sid VARCHAR(100)
);

-- Portfolio Health Snapshots (historical data for charts)
CREATE TABLE portfolio_snapshots (
  id SERIAL PRIMARY KEY,
  family_member_id INT REFERENCES family_members ON DELETE CASCADE,
  total_value DECIMAL(12,2),
  total_invested DECIMAL(12,2),
  total_gain_loss DECIMAL(12,2),
  gain_loss_percentage DECIMAL(5,2),
  health_score DECIMAL(3,1), -- 1-10
  allocation_json JSONB, -- sector-wise, asset-class-wise, etc.
  snapshot_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sell Recommendations Tracker
CREATE TABLE sell_recommendations (
  id SERIAL PRIMARY KEY,
  stock_holding_id INT REFERENCES stock_holdings ON DELETE CASCADE,
  reason VARCHAR(255), -- promoter_selling, debt_increase, earnings_fall, etc.
  recommendation VARCHAR(50), -- reduce_25, reduce_50, exit_fully
  confidence DECIMAL(3,2),
  days_before_action INT, -- urgency
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Enable RLS (Row Level Security)
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mf_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE other_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE capital_allocation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic owner access)
CREATE POLICY "Users can view their family members" ON family_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their family members" ON family_members
  FOR ALL USING (user_id = auth.uid());

-- Insert sample data (optional - remove if you want empty database)
-- This is commented out - uncomment if you want to start with sample data

-- INSERT INTO family_members (user_id, name, email, phone, role)
-- VALUES 
--   (auth.uid(), 'Pankaj Kapote', 'pankaj@example.com', '+919876543210', 'owner'),
--   (auth.uid(), 'Manjiri Kapote', 'manjiri@example.com', '+919876543211', 'spouse');

-- Verification query - run this to confirm tables are created
SELECT 
  table_name 
FROM 
  information_schema.tables 
WHERE 
  table_schema = 'public' 
ORDER BY 
  table_name;
