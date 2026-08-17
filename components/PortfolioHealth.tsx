'use client';

import React from 'react';
import {
  BarChart3,
  PieChart,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Zap,
} from 'lucide-react';
import { usePortfolioData } from '@/lib/usePortfolioData';

export default function PortfolioHealth() {
  const { stocks, mfs, summary } = usePortfolioData();

  if (!summary) {
    return <div className="text-slate-400">Loading portfolio health...</div>;
  }

  const allHoldings = [...stocks, ...mfs];
  const stockValue = stocks.reduce((sum, s) => sum + s.value_at_market, 0);
  const mfValue = mfs.reduce((sum, m) => sum + m.current_value, 0);
  const totalValue = stockValue + mfValue;

  const stockPercentage =
    totalValue > 0 ? ((stockValue / totalValue) * 100).toFixed(1) : '0';
  const mfPercentage =
    totalValue > 0 ? ((mfValue / totalValue) * 100).toFixed(1) : '0';

  // Concentration analysis
  const topHolding = allHoldings.sort(
    (a, b) =>
      ('value_at_market' in b ? b.value_at_market : b.current_value) -
      ('value_at_market' in a ? a.value_at_market : a.current_value)
  )[0];

  const topHoldingValue = topHolding
    ? 'value_at_market' in topHolding
      ? topHolding.value_at_market
      : topHolding.current_value
    : 0;

  const concentrationRatio =
    totalValue > 0 ? ((topHoldingValue / totalValue) * 100).toFixed(1) : '0';

  // Risk metrics
  const gainers = allHoldings.filter((h) => h.gain_loss >= 0).length;
  const losers = allHoldings.filter((h) => h.gain_loss < 0).length;

  const highVolatilityStocks = stocks.filter(
    (s) => Math.abs(s.gain_loss_percent) > 50
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Portfolio Composition"
          icon={<PieChart className="w-5 h-5" />}
        >
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Stocks</span>
                <span className="font-semibold">{stockPercentage}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${stockPercentage}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Mutual Funds</span>
                <span className="font-semibold">{mfPercentage}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{ width: `${mfPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </MetricCard>

        <MetricCard
          label="Profit/Loss Distribution"
          icon={<BarChart3 className="w-5 h-5" />}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gain" />
                <span className="text-sm">Gainers</span>
              </div>
              <span className="text-lg font-semibold text-gain">{gainers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-loss" />
                <span className="text-sm">Losers</span>
              </div>
              <span className="text-lg font-semibold text-loss">{losers}</span>
            </div>
            <div className="text-xs text-slate-400 pt-2 border-t border-slate-700">
              {gainers > losers
                ? `${((gainers / (gainers + losers)) * 100).toFixed(0)}% positions profitable`
                : `${((losers / (gainers + losers)) * 100).toFixed(0)}% positions in red`}
            </div>
          </div>
        </MetricCard>

        <MetricCard label="Concentration Risk" icon={<AlertCircle className="w-5 h-5" />}>
          <div className="space-y-3">
            <div>
              <div className="text-3xl font-bold text-invest-accent">
                {concentrationRatio}%
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Top holding: {topHolding ? ('symbol' in topHolding ? topHolding.symbol : topHolding.fund_name) : 'N/A'}
              </p>
            </div>
            <div className="text-xs text-slate-400 pt-2 border-t border-slate-700">
              {parseFloat(concentrationRatio) > 30
                ? '⚠️ Consider diversification'
                : '✓ Well distributed'}
            </div>
          </div>
        </MetricCard>
      </div>

      {/* Volatility & Risk Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-dark rounded-lg p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-invest-accent" />
            High Volatility Holdings
          </h3>
          {highVolatilityStocks > 0 ? (
            <div className="space-y-2">
              {stocks
                .filter((s) => Math.abs(s.gain_loss_percent) > 50)
                .slice(0, 5)
                .map((stock) => (
                  <div
                    key={stock.id}
                    className="flex items-center justify-between text-sm p-2 bg-slate-800/50 rounded"
                  >
                    <span className="font-medium">{stock.symbol}</span>
                    <span
                      className={
                        stock.gain_loss_percent >= 0 ? 'text-gain' : 'text-loss'
                      }
                    >
                      {stock.gain_loss_percent >= 0 ? '+' : ''}
                      {stock.gain_loss_percent.toFixed(1)}%
                    </span>
                  </div>
                ))}
              <p className="text-xs text-slate-400 mt-3">
                These holdings show significant price movement. Monitor regularly.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gain">
              <CheckCircle2 className="w-5 h-5" />
              <p className="text-sm">No high-volatility stocks</p>
            </div>
          )}
        </div>

        <div className="glass-dark rounded-lg p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gain" />
            Top Performers
          </h3>
          {summary.topGainers.length > 0 ? (
            <div className="space-y-2">
              {summary.topGainers.slice(0, 5).map((holding, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm p-2 bg-slate-800/50 rounded"
                >
                  <span className="font-medium">
                    {'symbol' in holding ? holding.symbol : holding.fund_name}
                  </span>
                  <span className="text-gain">
                    +{holding.gain_loss_percent.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No data yet</p>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass-dark rounded-lg p-6">
        <h3 className="font-semibold mb-4">Health Recommendations</h3>
        <div className="space-y-3">
          {parseFloat(concentrationRatio) > 30 && (
            <RecommendationItem
              type="warning"
              title="Reduce Concentration Risk"
              description={`Your top holding is ${concentrationRatio}% of portfolio. Consider diversifying into other sectors or holdings.`}
            />
          )}
          {gainers + losers > 0 && losers / (gainers + losers) > 0.4 && (
            <RecommendationItem
              type="warning"
              title="Monitor Losing Positions"
              description={`${losers} holdings are in red. Review if these are long-term holdings or if you should exit.`}
            />
          )}
          {highVolatilityStocks > 0 && (
            <RecommendationItem
              type="info"
              title="High Volatility Detected"
              description={`${highVolatilityStocks} holdings show >50% price swings. Keep position sizes in check.`}
            />
          )}
          {stocks.length > 0 && mfs.length > 0 && (
            <RecommendationItem
              type="success"
              title="Good Mix of Assets"
              description="You have both stocks and mutual funds. This provides balance between growth and stability."
            />
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-dark rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-invest-accent">{icon}</div>
        <h3 className="font-semibold text-sm">{label}</h3>
      </div>
      {children}
    </div>
  );
}

function RecommendationItem({
  type,
  title,
  description,
}: {
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
}) {
  const colors = {
    success: { bg: 'bg-green-900/20', border: 'border-green-800', icon: 'text-gain' },
    warning: { bg: 'bg-yellow-900/20', border: 'border-yellow-800', icon: 'text-yellow-400' },
    info: { bg: 'bg-blue-900/20', border: 'border-blue-800', icon: 'text-blue-400' },
  };

  const color = colors[type];

  return (
    <div className={`${color.bg} border ${color.border} rounded-lg p-3`}>
      <div className="flex gap-2">
        {type === 'success' && (
          <CheckCircle2 className={`w-5 h-5 ${color.icon} flex-shrink-0`} />
        )}
        {type === 'warning' && (
          <AlertCircle className={`w-5 h-5 ${color.icon} flex-shrink-0`} />
        )}
        {type === 'info' && (
          <Zap className={`w-5 h-5 ${color.icon} flex-shrink-0`} />
        )}
        <div>
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-slate-300 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}
