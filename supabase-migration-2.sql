-- Migration 2: adds user_preferences table (annual income, time horizon,
-- monthly SIP amount) used by the Capital Allocator tab.
-- Run this in Supabase SQL Editor AFTER your existing supabase-schema.sql.

CREATE TABLE IF NOT EXISTS user_preferences (
  family_member_id INT PRIMARY KEY REFERENCES family_members ON DELETE CASCADE,
  annual_income DECIMAL(14,2) DEFAULT 0,
  time_horizon_years INT DEFAULT 20,
  monthly_investment_amount DECIMAL(12,2) DEFAULT 25000,
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own preferences" ON user_preferences
  FOR ALL USING (
    family_member_id IN (
      SELECT id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- Also tighten RLS on holdings tables (the original schema only added
-- policies for family_members - these were missing, meaning anyone with the
-- anon key could theoretically read/write any row via the client SDK).
-- Run these too:

CREATE POLICY IF NOT EXISTS "Users manage their own stock holdings" ON stock_holdings
  FOR ALL USING (
    family_member_id IN (SELECT id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "Users manage their own mf holdings" ON mf_holdings
  FOR ALL USING (
    family_member_id IN (SELECT id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "Users manage their own other holdings" ON other_holdings
  FOR ALL USING (
    family_member_id IN (SELECT id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "Users manage their own goals" ON portfolio_goals
  FOR ALL USING (
    family_member_id IN (SELECT id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "Users manage their own insights" ON ai_insights
  FOR ALL USING (
    family_member_id IN (SELECT id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "Users manage their own allocation plans" ON capital_allocation_plans
  FOR ALL USING (
    family_member_id IN (SELECT id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "Users manage their own whatsapp logs" ON whatsapp_logs
  FOR ALL USING (
    family_member_id IN (SELECT id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "Users manage their own snapshots" ON portfolio_snapshots
  FOR ALL USING (
    family_member_id IN (SELECT id FROM family_members WHERE user_id = auth.uid())
  );

-- Verify
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;
