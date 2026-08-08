'use client';

import { supabase } from './supabaseClient';

export interface StockHolding {
  id: number;
  family_member_id: number;
  symbol: string;
  company_name: string;
  quantity: number;
  avg_cost_price: number;
  current_price: number;
  value_at_cost: number;
  value_at_market: number;
  unrealized_gain_loss: number;
  unrealized_gain_loss_pct: number;
  conviction_level: string | null;
  rating: string | null;
  owner_name?: string;
}

export interface MFHolding {
  id: number;
  family_member_id: number;
  fund_name: string;
  units: number | null;
  nav: number | null;
  current_nav: number | null;
  cost_value: number;
  current_value: number;
  owner_name?: string;
}

export interface UserPreferences {
  family_member_id: number;
  annual_income: number;
  time_horizon_years: number;
  monthly_investment_amount: number;
}

/**
 * Every authenticated user needs at least one row in `family_members` to own
 * their holdings. This creates one on first login if it doesn't exist yet -
 * that's how a brand new account starts completely blank instead of showing
 * someone else's demo portfolio.
 */
export async function getOrCreatePrimaryFamilyMember(
  userId: string,
  email: string | null | undefined
): Promise<number> {
  const { data: existing, error: fetchError } = await supabase
    .from('family_members')
    .select('id')
    .eq('user_id', userId)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (existing) return existing.id;

  const { data: created, error: insertError } = await supabase
    .from('family_members')
    .insert({
      user_id: userId,
      name: email?.split('@')[0] || 'Me',
      email: email || null,
      role: 'owner',
    })
    .select('id')
    .single();

  if (insertError) throw insertError;
  return created.id;
}

/** All family members belonging to the logged-in user (self + spouse etc.) */
export async function getFamilyMembers(userId: string) {
  const { data, error } = await supabase
    .from('family_members')
    .select('id, name, role')
    .eq('user_id', userId)
    .order('id', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getStockHoldings(
  familyMemberIds: number[]
): Promise<StockHolding[]> {
  if (familyMemberIds.length === 0) return [];

  const { data, error } = await supabase
    .from('stock_holdings')
    .select('*, family_members(name)')
    .in('family_member_id', familyMemberIds)
    .order('value_at_market', { ascending: false });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    ...row,
    owner_name: row.family_members?.name,
  }));
}

export async function getMFHoldings(
  familyMemberIds: number[]
): Promise<MFHolding[]> {
  if (familyMemberIds.length === 0) return [];

  const { data, error } = await supabase
    .from('mf_holdings')
    .select('*, family_members(name)')
    .in('family_member_id', familyMemberIds)
    .order('current_value', { ascending: false });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    ...row,
    owner_name: row.family_members?.name,
  }));
}

export interface NewStockHoldingInput {
  family_member_id: number;
  symbol: string;
  company_name: string;
  quantity: number;
  avg_cost_price: number;
  current_price: number;
  conviction_level?: string;
  rating?: string;
}

export async function addStockHolding(input: NewStockHoldingInput) {
  const value_at_cost = input.quantity * input.avg_cost_price;
  const value_at_market = input.quantity * input.current_price;
  const unrealized_gain_loss = value_at_market - value_at_cost;
  const unrealized_gain_loss_pct =
    value_at_cost > 0 ? (unrealized_gain_loss / value_at_cost) * 100 : 0;

  const { error } = await supabase.from('stock_holdings').insert({
    ...input,
    value_at_cost,
    value_at_market,
    unrealized_gain_loss,
    unrealized_gain_loss_pct,
    conviction_level: input.conviction_level || 'medium',
    rating: input.rating || 'hold',
  });

  if (error) throw error;
}

export async function bulkAddStockHoldings(rows: NewStockHoldingInput[]) {
  const prepared = rows.map((input) => {
    const value_at_cost = input.quantity * input.avg_cost_price;
    const value_at_market = input.quantity * input.current_price;
    const unrealized_gain_loss = value_at_market - value_at_cost;
    const unrealized_gain_loss_pct =
      value_at_cost > 0 ? (unrealized_gain_loss / value_at_cost) * 100 : 0;
    return {
      ...input,
      value_at_cost,
      value_at_market,
      unrealized_gain_loss,
      unrealized_gain_loss_pct,
      conviction_level: input.conviction_level || 'medium',
      rating: input.rating || 'hold',
    };
  });

  const { error } = await supabase.from('stock_holdings').insert(prepared);
  if (error) throw error;
}

export interface NewMFHoldingInput {
  family_member_id: number;
  fund_name: string;
  units?: number;
  nav?: number;
  current_nav?: number;
  cost_value: number;
  current_value: number;
}

export async function addMFHolding(input: NewMFHoldingInput) {
  const { error } = await supabase.from('mf_holdings').insert(input);
  if (error) throw error;
}

export async function bulkAddMFHoldings(rows: NewMFHoldingInput[]) {
  const { error } = await supabase.from('mf_holdings').insert(rows);
  if (error) throw error;
}

export async function deleteStockHolding(id: number) {
  const { error } = await supabase.from('stock_holdings').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteMFHolding(id: number) {
  const { error } = await supabase.from('mf_holdings').delete().eq('id', id);
  if (error) throw error;
}

/** Computed summary used across Dashboard, Health, and AI Insights tabs */
export function computePortfolioSummary(
  stocks: StockHolding[],
  mfs: MFHolding[]
) {
  const stockValue = stocks.reduce((sum, s) => sum + (s.value_at_market || 0), 0);
  const stockCost = stocks.reduce((sum, s) => sum + (s.value_at_cost || 0), 0);
  const mfValue = mfs.reduce((sum, m) => sum + (m.current_value || 0), 0);
  const mfCost = mfs.reduce((sum, m) => sum + (m.cost_value || 0), 0);

  const totalValue = stockValue + mfValue;
  const totalInvested = stockCost + mfCost;
  const totalGains = totalValue - totalInvested;
  const gainPercentage = totalInvested > 0 ? (totalGains / totalInvested) * 100 : 0;

  const topHoldings = [...stocks]
    .sort((a, b) => (b.value_at_market || 0) - (a.value_at_market || 0))
    .slice(0, 5);

  return {
    totalValue,
    totalInvested,
    totalGains,
    gainPercentage,
    holdingsCount: stocks.length + mfs.length,
    stockCount: stocks.length,
    mfCount: mfs.length,
    topHoldings,
  };
}

/** User preferences: annual income, time horizon, monthly SIP amount */
export async function getUserPreferences(
  familyMemberId: number
): Promise<UserPreferences | null> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('family_member_id', familyMemberId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function upsertUserPreferences(prefs: UserPreferences) {
  const { error } = await supabase
    .from('user_preferences')
    .upsert(prefs, { onConflict: 'family_member_id' });

  if (error) throw error;
}
