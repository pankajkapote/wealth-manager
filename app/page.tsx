'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, Zap, Wallet, Menu, X } from 'lucide-react';
import PortfolioHealth from '@/components/PortfolioHealth';
import HoldingsOverview from '@/components/HoldingsOverview';
import AIInsights from '@/components/AIInsights';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';
import MarketTicker from '@/components/MarketTicker';
import { usePortfolioData } from '@/lib/usePortfolioData';

function Dashboard() {
  const [selectedView, setSelectedView] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { summary, loading, isEmpty } = usePortfolioData();

  const views = {
    overview: {
      title: 'Portfolio Overview',
      icon: <Wallet className="w-5 h-5" />,
    },
    health: {
      title: 'Portfolio Health',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    insights: {
      title: 'AI Insights',
      icon: <Zap className="w-5 h-5" />,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-30 glass-dark border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-invest-accent rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Wealth Manager</h1>
                <p className="text-xs text-slate-400">Your Personal AI Analyst</p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-slate-700 rounded-lg transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          <MarketTicker />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Navigation
            selectedView={selectedView}
            setSelectedView={setSelectedView}
            views={views}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />

          <main className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-invest-accent"></div>
                </div>
                <p className="mt-4 text-slate-400">Loading your portfolio...</p>
              </div>
            ) : (
              <>
                {!isEmpty && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                      label="Total Portfolio Value"
                      value={`₹${summary.totalValue.toLocaleString('en-IN')}`}
                      change={`${summary.gainPercentage >= 0 ? '+' : ''}${summary.gainPercentage.toFixed(1)}%`}
                      isPositive={summary.gainPercentage >= 0}
                      icon={<Wallet className="w-5 h-5" />}
                    />
                    <StatCard
                      label="Unrealized Gains"
                      value={`₹${summary.totalGains.toLocaleString('en-IN')}`}
                      change={`${summary.holdingsCount} holdings`}
                      isPositive={summary.totalGains >= 0}
                      icon={<TrendingUp className="w-5 h-5" />}
                    />
                    <StatCard
                      label="Stocks vs Funds"
                      value={`${summary.stockCount} / ${summary.mfCount}`}
                      change="stocks / MF schemes"
                      isPositive={true}
                      icon={<BarChart3 className="w-5 h-5" />}
                    />
                  </div>
                )}

                <div className="animate-fade-in">
                  {selectedView === 'overview' && <HoldingsOverview />}
                  {selectedView === 'health' && <PortfolioHealth />}
                  {selectedView === 'insights' && <AIInsights />}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      <footer className="border-t border-slate-700 mt-12 py-6 px-4">
        <div className="max-w-7xl mx-auto text-center text-slate-400 text-sm">
          <p>
            Personal AI Wealth Manager • Built with Claude API & Supabase • Last
            updated: {new Date().toLocaleDateString('en-IN')}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Disclaimer: This tool provides analysis only. Always consult a
            financial advisor for investment decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  isPositive,
  icon,
}: {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="glass rounded-lg p-4 card-hover">
      <div className="flex items-start justify-between mb-3">
        <span className="text-slate-400 text-sm">{label}</span>
        <div className="text-invest-accent">{icon}</div>
      </div>
      <div className="mb-2">
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <p className={`text-sm ${isPositive ? 'text-gain' : 'text-loss'}`}>{change}</p>
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}
