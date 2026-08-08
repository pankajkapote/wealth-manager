'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertCircle, Zap, Target, Wallet, Menu, X } from 'lucide-react';
import PortfolioHealth from '@/components/PortfolioHealth';
import HoldingsOverview from '@/components/HoldingsOverview';
import AIInsights from '@/components/AIInsights';
import CapitalAllocator from '@/components/CapitalAllocator';
import Navigation from '@/components/Navigation';

export default function Dashboard() {
  const [selectedView, setSelectedView] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 500);
  }, []);

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
    allocate: {
      title: 'Capital Allocator',
      icon: <Target className="w-5 h-5" />,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-dark border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
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
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation Sidebar */}
          <Navigation
            selectedView={selectedView}
            setSelectedView={setSelectedView}
            views={views}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />

          {/* Main Content */}
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
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard
                    label="Total Portfolio Value"
                    value="₹ 62.5 Lakh"
                    change="+12.3%"
                    isPositive={true}
                    icon={<Wallet className="w-5 h-5" />}
                  />
                  <StatCard
                    label="Unrealized Gains"
                    value="₹ 15.2 Lakh"
                    change="+18.5%"
                    isPositive={true}
                    icon={<TrendingUp className="w-5 h-5" />}
                  />
                  <StatCard
                    label="Health Score"
                    value="8.2 / 10"
                    change="Very Healthy"
                    isPositive={true}
                    icon={<BarChart3 className="w-5 h-5" />}
                  />
                </div>

                {/* Main Content Area */}
                <div className="animate-fade-in">
                  {selectedView === 'overview' && (
                    <>
                      <HoldingsOverview />
                      <div className="glass-dark rounded-lg p-6 card-hover">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                          Action Items This Week
                        </h2>
                        <div className="space-y-3">
                          <ActionItem
                            priority="high"
                            title="Review: Yes Bank Position"
                            description="Down 92% from cost. Consider reducing further."
                          />
                          <ActionItem
                            priority="medium"
                            title="Monitor: L&T Valuation"
                            description="PE near 5-year low. Good accumulation opportunity."
                          />
                          <ActionItem
                            priority="low"
                            title="Rebalance: Portfolio Allocation"
                            description="ICICI Bank now 14% of portfolio (target: 10%)"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  {selectedView === 'health' && <PortfolioHealth />}
                  {selectedView === 'insights' && <AIInsights />}
                  {selectedView === 'allocate' && <CapitalAllocator />}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 mt-12 py-6 px-4">
        <div className="max-w-7xl mx-auto text-center text-slate-400 text-sm">
          <p>
            Personal AI Wealth Manager • Built with Claude API & Supabase • Last updated:{' '}
            {new Date().toLocaleDateString('en-IN')}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Disclaimer: This tool provides analysis only. Always consult a financial advisor for investment decisions.
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

function ActionItem({
  priority,
  title,
  description,
}: {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}) {
  const priorityColors = {
    high: 'border-l-red-500 bg-red-900/10',
    medium: 'border-l-yellow-500 bg-yellow-900/10',
    low: 'border-l-blue-500 bg-blue-900/10',
  };

  return (
    <div
      className={`border-l-4 p-4 rounded ${priorityColors[priority]} hover:bg-opacity-20 transition`}
    >
      <p className="font-medium text-sm">{title}</p>
      <p className="text-xs text-slate-400 mt-1">{description}</p>
    </div>
  );
}
