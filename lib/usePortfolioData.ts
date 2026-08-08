'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  getOrCreatePrimaryFamilyMember,
  getFamilyMembers,
  getStockHoldings,
  getMFHoldings,
  computePortfolioSummary,
  StockHolding,
  MFHolding,
} from './portfolio';

export function usePortfolioData() {
  const { user } = useAuth();
  const [familyMemberId, setFamilyMemberId] = useState<number | null>(null);
  const [familyMemberIds, setFamilyMemberIds] = useState<number[]>([]);
  const [stocks, setStocks] = useState<StockHolding[]>([]);
  const [mfs, setMfs] = useState<MFHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // First login ever? This creates a blank family_members row for the
      // user instead of showing anyone else's demo data.
      const primaryId = await getOrCreatePrimaryFamilyMember(user.id, user.email);
      setFamilyMemberId(primaryId);

      const members = await getFamilyMembers(user.id);
      const ids = members.map((m) => m.id);
      setFamilyMemberIds(ids);

      const [stockData, mfData] = await Promise.all([
        getStockHoldings(ids),
        getMFHoldings(ids),
      ]);
      setStocks(stockData);
      setMfs(mfData);
    } catch (err: any) {
      setError(err.message || 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const summary = computePortfolioSummary(stocks, mfs);

  return {
    familyMemberId,
    familyMemberIds,
    stocks,
    mfs,
    summary,
    loading,
    error,
    refresh,
    isEmpty: !loading && stocks.length === 0 && mfs.length === 0,
  };
}
