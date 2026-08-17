import { useEffect, useState } from 'react';
import {
  getOrCreatePrimaryFamilyMember,
  getStockHoldings,
  getMFHoldings,
  computePortfolioSummary,
  StockHolding,
  MFHolding,
  PortfolioSummary,
} from '@/lib/portfolio';

export function usePortfolioData() {
  const [familyMemberId, setFamilyMemberId] = useState<number | null>(null);
  const [stocks, setStocks] = useState<StockHolding[]>([]);
  const [mfs, setMfs] = useState<MFHolding[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get or create primary family member
      const member = await getOrCreatePrimaryFamilyMember();
      setFamilyMemberId(member.id);

      // Fetch holdings
      const stocksData = await getStockHoldings(member.id);
      const mfsData = await getMFHoldings(member.id);
      setStocks(stocksData);
      setMfs(mfsData);

      // Compute summary
      const summaryData = await computePortfolioSummary(member.id);
      setSummary(summaryData);
    } catch (err: any) {
      console.error('Error loading portfolio data:', err);
      setError(err.message || 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    if (!familyMemberId) return;
    try {
      const stocksData = await getStockHoldings(familyMemberId);
      const mfsData = await getMFHoldings(familyMemberId);
      setStocks(stocksData);
      setMfs(mfsData);

      const summaryData = await computePortfolioSummary(familyMemberId);
      setSummary(summaryData);
    } catch (err: any) {
      console.error('Error refetching data:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    loadPortfolioData();
  }, []);

  return {
    familyMemberId,
    stocks,
    mfs,
    summary,
    loading,
    error,
    isEmpty: stocks.length === 0 && mfs.length === 0,
    refetch,
  };
}
