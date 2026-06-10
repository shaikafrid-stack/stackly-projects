import React from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useApp } from '../context/AppContext';
import { useDerivedStats } from '../hooks/useDerivedStats';
import { useBudget } from '../hooks/useBudget';
import { EmptyState, PageHeader } from '../components/UI';
import { formatCurrency } from '../utils/formatCurrency';
import { getMonthLabel } from '../utils/dateHelpers';
import { CHART_COLORS } from '../utils/constants';

export const Analytics: React.FC = () => {
  const { state } = useApp();
  const stats = useDerivedStats(state.transactions);
  const budgetStatuses = useBudget(state.budgetGoals, state.transactions);
  const fmt = (n: number) => formatCurrency(n, state.currency);

  const barData = stats.monthlySummaries.map((s) => ({
    month: getMonthLabel(s.month),
    Income: s.income,
    Expenses: s.expenses,
  }));

  const savingsData = stats.monthlySummaries.map((s) => ({
    month: getMonthLabel(s.month),
    'Net Savings': s.net,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Deep dive into your finances" />

      {/* Bar Chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-text mb-4">Monthly Income vs Expenses (12 months)</h3>
        {state.transactions.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
              <XAxis dataKey="month" tick={{ fill: '#6b6b8a', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b6b8a', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#1a1a26', border: '1px solid #2a2a3a', borderRadius: 8 }}
                formatter={(v: number) => fmt(v)}
              />
              <Legend />
              <Bar dataKey="Income" fill="#43d9ad" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#ff6584" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyState message="No data available" />}
      </div>

      {/* Savings Trend */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-text mb-4">Net Savings Trend</h3>
        {state.transactions.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={savingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
              <XAxis dataKey="month" tick={{ fill: '#6b6b8a', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b6b8a', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#1a1a26', border: '1px solid #2a2a3a', borderRadius: 8 }}
                formatter={(v: number) => fmt(v)}
              />
              <Line type="monotone" dataKey="Net Savings" stroke="#6c63ff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : <EmptyState message="No data available" />}
      </div>

      {/* Day of Week spending */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-text">Spending by Day of Week</h3>
          <span className="text-xs text-muted">Highest: <span className="text-accent">{stats.highestDay}</span></span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={stats.dayChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
            <XAxis dataKey="day" tick={{ fill: '#6b6b8a', fontSize: 11 }} />
            <YAxis tick={{ fill: '#6b6b8a', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#1a1a26', border: '1px solid #2a2a3a', borderRadius: 8 }}
              formatter={(v: number) => fmt(v)}
            />
            <Bar dataKey="amount" fill="#6c63ff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-medium text-text">Category Breakdown</h3>
        </div>
        {stats.categorySummaries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs text-muted font-medium">Category</th>
                  <th className="text-right px-4 py-3 text-xs text-muted font-medium">Total Spent</th>
                  <th className="text-right px-4 py-3 text-xs text-muted font-medium">% of Total</th>
                  <th className="text-right px-4 py-3 text-xs text-muted font-medium hidden md:table-cell">Budget</th>
                </tr>
              </thead>
              <tbody>
                {stats.categorySummaries.map((c, i) => {
                  const budget = budgetStatuses.find((b) => b.goal.category === c.category);
                  return (
                    <tr key={c.category} className="border-b border-border last:border-0 hover:bg-surface/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <span className="text-sm text-text">{c.category}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-accent-2">{fmt(c.total)}</td>
                      <td className="px-4 py-3 text-right text-sm text-muted">{c.percentage.toFixed(1)}%</td>
                      <td className="px-4 py-3 text-right text-sm text-muted hidden md:table-cell">
                        {budget ? fmt(budget.goal.monthlyLimit) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="No expense data to analyze" />
        )}
      </div>
    </div>
  );
};
