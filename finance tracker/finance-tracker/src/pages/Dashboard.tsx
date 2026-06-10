import React, { useState } from 'react';
import {
  LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Percent, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDerivedStats } from '../hooks/useDerivedStats';
import { useTransactions } from '../hooks/useTransactions';
import { TransactionForm } from '../components/TransactionForm';
import { StatCard, Badge, EmptyState, PageHeader } from '../components/UI';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate, getMonthLabel } from '../utils/dateHelpers';
import { DateRange } from '../types';
import { CHART_COLORS } from '../utils/constants';

export const Dashboard: React.FC = () => {
  const { state } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('month');

  const { filters, updateFilter, filtered } = useTransactions(state.transactions);

  const stats = useDerivedStats(filtered);
  const globalStats = useDerivedStats(state.transactions);

  const fmt = (n: number) => formatCurrency(n, state.currency);

  const chartData = globalStats.last6Summaries.map((s) => ({
    month: getMonthLabel(s.month),
    Income: s.income,
    Expenses: s.expenses,
  }));

  const pieData = globalStats.categorySummaries.slice(0, 8).map((c) => ({
    name: c.category,
    value: c.total,
  }));

  const recent = state.transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  React.useEffect(() => {
    updateFilter('dateRange', dateRange);
  }, [dateRange]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Your financial overview"
        actions={
          <>
            <div className="flex gap-1 bg-surface border border-border rounded-lg p-1">
              {(['week', 'month', 'year', 'all'] as DateRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${dateRange === r ? 'bg-accent text-white' : 'text-muted hover:text-text'}`}
                >
                  {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Add
            </button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Net Balance"
          value={fmt(stats.netBalance)}
          accent={stats.netBalance >= 0 ? 'green' : 'red'}
          icon={<Wallet size={18} />}
        />
        <StatCard
          label="Total Income"
          value={fmt(stats.totalIncome)}
          accent="green"
          icon={<TrendingUp size={18} />}
        />
        <StatCard
          label="Total Expenses"
          value={fmt(stats.totalExpenses)}
          accent="red"
          icon={<TrendingDown size={18} />}
        />
        <StatCard
          label="Savings Rate"
          value={`${stats.savingsRate.toFixed(1)}%`}
          accent="blue"
          icon={<Percent size={18} />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-text mb-4">Income vs Expenses (6 months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
              <XAxis dataKey="month" tick={{ fill: '#6b6b8a', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b6b8a', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#1a1a26', border: '1px solid #2a2a3a', borderRadius: 8 }}
                labelStyle={{ color: '#e8e8f0' }}
              />
              <Legend />
              <Line type="monotone" dataKey="Income" stroke="#43d9ad" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Expenses" stroke="#ff6584" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-text mb-4">Spending by Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1a1a26', border: '1px solid #2a2a3a', borderRadius: 8 }}
                  formatter={(v: number) => fmt(v)}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No expense data" />
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-text mb-4">Recent Transactions</h3>
        {recent.length > 0 ? (
          <div className="space-y-2">
            {recent.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${t.type === 'income' ? 'bg-accent-3/20 text-accent-3' : 'bg-accent-2/20 text-accent-2'}`}>
                    {t.category.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm text-text">{t.description}</p>
                    <p className="text-xs text-muted">{formatDate(t.date)} · {t.category}</p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${t.type === 'income' ? 'text-accent-3' : 'text-accent-2'}`}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="No transactions yet" />
        )}
      </div>

      {showForm && <TransactionForm onClose={() => setShowForm(false)} />}
    </div>
  );
};
