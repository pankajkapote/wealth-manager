'use client';

import React, { useEffect, useState } from 'react';
import { Target, Loader2, CheckCircle2 } from 'lucide-react';
import { usePortfolioData } from '@/lib/usePortfolioData';
import { getUserPreferences, upsertUserPreferences } from '@/lib/portfolio';

export default function CapitalAllocator() {
  const { familyMemberId, summary, loading } = usePortfolioData();

  const [monthlyInvestment, setMonthlyInvestment] = useState(25000);
  const [annualIncome, setAnnualIncome] = useState(1200000);
  const [timeHorizon, setTimeHorizon] = useState(20);
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!familyMemberId) return;
    (async () => {
      try {
        const prefs = await getUserPreferences(familyMemberId);
        if (prefs) {
          setAnnualIncome(prefs.annual_income ?? 1200000);
          setTimeHorizon(prefs.time_horizon_years ?? 20);
          setMonthlyInvestment(prefs.monthly_investment_amount ?? 25000);
        }
      } finally {
        setPrefsLoading(false);
      }
    })();
  }, [familyMemberId]);

  const handleSave = async () => {
    if (!familyMemberId) return;
    setSaving(true);
    setSaved(false);
    try {
      await upsertUserPreferences({
        family_member_id: familyMemberId,
        annual_income: annualIncome,
        time_horizon_years: timeHorizon,
        monthly_investment_amount: monthlyInvestment,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  // Simple illustrative split — 60% toward your existing largest holdings
  // (dollar-cost-averaging into what you already believe in), 30% toward
  // diversification if you hold mutual funds, 10% cash buffer. This is a
  // starting framework, not a recommendation engine.
  const topPick = summary.topHoldings[0];
  const allocations = [
    topPick && {
      label: `Add to ${topPick.symbol}`,
      amount: Math.round(monthlyInvestment * 0.4),
      percentage: 40,
      note: 'Your largest existing position — ask the AI chat whether adding here still fits your thesis.',
    },
    {
      label: 'Diversified Mutual Fund / Index Fund',
      amount: Math.round(monthlyInvestment * 0.4),
      percentage: 40,
      note: 'Spreads risk beyond individual stock picks.',
    },
    {
      label: 'Cash Reserve',
      amount: Math.round(monthlyInvestment * 0.2),
      percentage: 20,
      note: 'Keeps flexibility for opportunities or emergencies.',
    },
  ].filter(Boolean) as { label: string; amount: number; percentage: number; note: string }[];

  const totalAllocated = allocations.reduce((s, a) => s + a.amount, 0);

  if (loading || prefsLoading) {
    return (
      <div className="glass-dark rounded-lg p-8 text-center text-slate-400 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-dark rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-invest-accent" />
          Your Investment Profile
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">
              Monthly Investable Amount (₹)
            </label>
            <input
              type="number"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(parseInt(e.target.value) || 0)}
              className="text-xl font-bold bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-invest-accent"
            />
            <p className="text-xs text-slate-400 mt-2">
              Annual: ₹{(monthlyInvestment * 12).toLocaleString('en-IN')}
            </p>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">
              Annual Income (₹)
            </label>
            <input
              type="number"
              value={annualIncome}
              onChange={(e) => setAnnualIncome(parseInt(e.target.value) || 0)}
              className="text-xl font-bold bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-invest-accent"
            />
            <p className="text-xs text-slate-400 mt-2">
              SIP ratio:{' '}
              {annualIncome > 0
                ? ((monthlyInvestment * 12 * 100) / annualIncome).toFixed(1)
                : '0'}
              %
            </p>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">
              Time Horizon (years)
            </label>
            <input
              type="number"
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(parseInt(e.target.value) || 0)}
              className="text-xl font-bold bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-invest-accent"
            />
            <p className="text-xs text-slate-400 mt-2">Until your target goal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Profile
          </button>
          {saved && (
            <span className="text-sm text-gain flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Saved
            </span>
          )}
        </div>
      </div>

      {/* Allocation Plan */}
      <div className="glass-dark rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-2">This Month's Allocation</h3>
        <p className="text-slate-400 text-sm mb-6">
          A simple starting framework based on your current largest holding and
          monthly amount. Not personalized investment advice — use the AI chat
          to sanity-check specifics.
        </p>

        <div className="flex gap-2 h-8 rounded-lg overflow-hidden mb-4 bg-slate-700">
          {allocations.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center text-xs font-medium text-white bg-invest-accent/80"
              style={{
                width: `${item.percentage}%`,
                backgroundColor: idx === 0 ? '#1e40af' : idx === 1 ? '#0f172a' : '#475569',
              }}
              title={item.label}
            >
              {item.percentage}%
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {allocations.map((item, idx) => (
            <div key={idx} className="border border-slate-600 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium">{item.label}</p>
                <p className="text-lg font-bold">₹{item.amount.toLocaleString('en-IN')}</p>
              </div>
              <p className="text-xs text-slate-400">{item.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-600 grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400 text-sm">Total Amount</p>
            <p className="text-xl font-bold">₹{monthlyInvestment.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Allocated</p>
            <p className="text-xl font-bold text-gain">
              ₹{totalAllocated.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
