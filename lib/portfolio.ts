import { supabase } from '@/lib/supabaseClient';

export interface NewStockHoldingInput {
  family_member_id: number;
  symbol: string;
  company_name: string;
  quantity: number;
  avg_cost_price: number;
  current_price: number;
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
  gain_loss: number;
  gain_loss_percent: number;
  owner_name?: string;
}

export interface MFHolding {
  id: number;
  family_member_id: number;
  fund_name: string;
  units?: number;
  nav?: number;
  current_nav?: number;
  cost_value: number;
  current_value: number;
  gain_loss: number;
  gain_loss_percent: number;
  owner_name?: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalGains: number;
  gainPercentage: number;
  holdingsCount: number;
  stockCount: number;
  mfCount: number;
  topGainers: (StockHolding | MFHolding)[];
  topLosers: (StockHolding | MFHolding)[];
}

/**
 * Get or create the primary family member for the current user
 */
export async function getOrCreatePrimaryFamilyMember(): Promise<{
  id: number;
  user_id: string;
  name: string;
  relationship: string;
  phone?: string;
}> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Try to get existing member
  const { data: existing, error: fetchError } = await supabase
    .from('family_members')
    .select('*')
    .eq('user_id', user.id)
    .order('id', { ascending: true })
    .limit(1)
    .single();

  if (existing && !fetchError) {
    return existing;
  }

  // Create new primary member
  const { data: created, error: createError } = await supabase
    .from('family_members')
    .insert([
      {
        user_id: user.id,
        name: 'Primary Account',
        relationship: 'self',
      },
    ])
    .select()
    .single();

  if (createError || !created) {
    throw createError || new Error('Failed to create family member');
  }

  return created;
}

/**
 * Get all stock holdings for a family member
 */
export async function getStockHoldings(
  familyMemberId: number
): Promise<StockHolding[]> {
  const { data, error } = await supabase
    .from('stock_holdings')
    .select(
      `
      *,
      family_members:family_member_id(name)
    `
    )
    .eq('family_member_id', familyMemberId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    ...row,
    owner_name: row.family_members?.name || 'Unknown',
  }));
}

/**
 * Get all MF holdings for a family member
 */
export async function getMFHoldings(
  familyMemberId: number
): Promise<MFHolding[]> {
  const { data, error } = await supabase
    .from('mf_holdings')
    .select(
      `
      *,
      family_members:family_member_id(name)
    `
    )
    .eq('family_member_id', familyMemberId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    ...row,
    owner_name: row.family_members?.name || 'Unknown',
  }));
}

/**
 * Add a single stock holding
 */
export async function addStockHolding(input: NewStockHoldingInput) {
  const valueAtCost = input.quantity * input.avg_cost_price;
  const valueAtMarket = input.quantity * input.current_price;
  const gainLoss = valueAtMarket - valueAtCost;
  const gainLossPercent =
    valueAtCost > 0 ? (gainLoss / valueAtCost) * 100 : 0;

  const { data, error } = await supabase
    .from('stock_holdings')
    .insert([
      {
        family_member_id: input.family_member_id,
        symbol: input.symbol,
        company_name: input.company_name,
        quantity: input.quantity,
        avg_cost_price: input.avg_cost_price,
        current_price: input.current_price,
        value_at_cost: valueAtCost,
        value_at_market: valueAtMarket,
        gain_loss: gainLoss,
        gain_loss_percent: gainLossPercent,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Add a single MF holding
 */
export async function addMFHolding(input: NewMFHoldingInput) {
  const gainLoss = input.current_value - input.cost_value;
  const gainLossPercent =
    input.cost_value > 0 ? (gainLoss / input.cost_value) * 100 : 0;

  const { data, error } = await supabase
    .from('mf_holdings')
    .insert([
      {
        family_member_id: input.family_member_id,
        fund_name: input.fund_name,
        units: input.units || null,
        nav: input.nav || null,
        current_nav: input.current_nav || null,
        cost_value: input.cost_value,
        current_value: input.current_value,
        gain_loss: gainLoss,
        gain_loss_percent: gainLossPercent,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Bulk add stock holdings
 */
export async function bulkAddStockHoldings(
  inputs: NewStockHoldingInput[]
): Promise<number> {
  const rows = inputs.map((input) => {
    const valueAtCost = input.quantity * input.avg_cost_price;
    const valueAtMarket = input.quantity * input.current_price;
    const gainLoss = valueAtMarket - valueAtCost;
    const gainLossPercent = valueAtCost > 0 ? (gainLoss / valueAtCost) * 100 : 0;

    return {
      family_member_id: input.family_member_id,
      symbol: input.symbol,
      company_name: input.company_name,
      quantity: input.quantity,
      avg_cost_price: input.avg_cost_price,
      current_price: input.current_price,
      value_at_cost: valueAtCost,
      value_at_market: valueAtMarket,
      gain_loss: gainLoss,
      gain_loss_percent: gainLossPercent,
    };
  });

  const { data, error } = await supabase
    .from('stock_holdings')
    .insert(rows)
    .select();

  if (error) throw error;
  return (data || []).length;
}

/**
 * Bulk add MF holdings
 */
export async function bulkAddMFHoldings(
  inputs: NewMFHoldingInput[]
): Promise<number> {
  const rows = inputs.map((input) => {
    const gainLoss = input.current_value - input.cost_value;
    const gainLossPercent =
      input.cost_value > 0 ? (gainLoss / input.cost_value) * 100 : 0;

    return {
      family_member_id: input.family_member_id,
      fund_name: input.fund_name,
      units: input.units || null,
      nav: input.nav || null,
      current_nav: input.current_nav || null,
      cost_value: input.cost_value,
      current_value: input.current_value,
      gain_loss: gainLoss,
      gain_loss_percent: gainLossPercent,
    };
  });

  const { data, error } = await supabase
    .from('mf_holdings')
    .insert(rows)
    .select();

  if (error) throw error;
  return (data || []).length;
}

/**
 * Delete a stock holding
 */
export async function deleteStockHolding(id: number) {
  const { error } = await supabase
    .from('stock_holdings')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Delete an MF holding
 */
export async function deleteMFHolding(id: number) {
  const { error } = await supabase
    .from('mf_holdings')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Compute comprehensive portfolio summary
 */
export async function computePortfolioSummary(
  familyMemberId: number
): Promise<PortfolioSummary> {
  const stocks = await getStockHoldings(familyMemberId);
  const mfs = await getMFHoldings(familyMemberId);

  const allHoldings: (StockHolding | MFHolding)[] = [...stocks, ...mfs];

  const totalValue = allHoldings.reduce(
    (sum, h) => sum + ('value_at_market' in h ? h.value_at_market : h.current_value),
    0
  );
  const totalInvested = allHoldings.reduce(
    (sum, h) => sum + ('value_at_cost' in h ? h.value_at_cost : h.cost_value),
    0
  );
  const totalGains = totalValue - totalInvested;
  const gainPercentage =
    totalInvested > 0 ? (totalGains / totalInvested) * 100 : 0;

  // Top gainers and losers
  const sorted = [...allHoldings].sort(
    (a, b) => b.gain_loss_percent - a.gain_loss_percent
  );
  const topGainers = sorted.slice(0, 5);
  const topLosers = sorted.slice(-5).reverse();

  return {
    totalValue,
    totalInvested,
    totalGains,
    gainPercentage,
    holdingsCount: allHoldings.length,
    stockCount: stocks.length,
    mfCount: mfs.length,
    topGainers,
    topLosers,
  };
}

/**
 * Get user preferences
 */
export async function getUserPreferences() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

/**
 * Upsert user preferences
 */
export async function upsertUserPreferences(preferences: {
  currency?: string;
  notification_frequency?: string;
  investment_horizon_years?: number;
  risk_tolerance?: string;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: user.id,
        ...preferences,
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}
