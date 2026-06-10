import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit2, ArrowUpDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTransactions } from '../hooks/useTransactions';
import { TransactionForm } from '../components/TransactionForm';
import { Badge, EmptyState, Pagination, ConfirmDialog, PageHeader } from '../components/UI';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/dateHelpers';
import { Transaction, DateRange, TransactionType } from '../types';

export const Transactions: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Transaction | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { filters, updateFilter, paginated, page, setPage, totalPages, filtered } =
    useTransactions(state.transactions);

  const fmt = (n: number) => formatCurrency(n, state.currency);

  const handleDelete = () => {
    if (deleteId) {
      dispatch({ type: 'DELETE_TRANSACTION', payload: deleteId });
      setDeleteId(null);
    }
  };

  const toggleSort = (col: 'date' | 'amount') => {
    if (filters.sortBy === col) {
      updateFilter('sortDir', filters.sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      updateFilter('sortBy', col);
      updateFilter('sortDir', 'desc');
    }
  };

  return (
    <div>
      <PageHeader
        title="Transactions"
        subtitle={`${filtered.length} transactions`}
        actions={
          <button
            onClick={() => { setEditing(undefined); setShowForm(true); }}
            className="flex items-center gap-2 bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus size={16} /> Add
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search..."
            className="w-full bg-surface border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-text outline-none focus:border-accent"
          />
        </div>

        <select
          value={filters.category}
          onChange={(e) => updateFilter('category', e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-accent"
        >
          <option value="all">All Categories</option>
          {state.categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={filters.type}
          onChange={(e) => updateFilter('type', e.target.value as TransactionType | 'all')}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-accent"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={filters.dateRange}
          onChange={(e) => updateFilter('dateRange', e.target.value as DateRange)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-accent"
        >
          <option value="all">All Time</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {paginated.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th
                      className="text-left px-4 py-3 text-xs text-muted font-medium cursor-pointer hover:text-text"
                      onClick={() => toggleSort('date')}
                    >
                      <span className="flex items-center gap-1">Date <ArrowUpDown size={12} /></span>
                    </th>
                    <th className="text-left px-4 py-3 text-xs text-muted font-medium">Description</th>
                    <th className="text-left px-4 py-3 text-xs text-muted font-medium hidden md:table-cell">Category</th>
                    <th className="text-left px-4 py-3 text-xs text-muted font-medium hidden sm:table-cell">Type</th>
                    <th
                      className="text-right px-4 py-3 text-xs text-muted font-medium cursor-pointer hover:text-text"
                      onClick={() => toggleSort('amount')}
                    >
                      <span className="flex items-center justify-end gap-1">Amount <ArrowUpDown size={12} /></span>
                    </th>
                    <th className="text-right px-4 py-3 text-xs text-muted font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((t) => (
                    <tr key={t.id} className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-muted whitespace-nowrap">{formatDate(t.date)}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-text">{t.description}</p>
                        {t.notes && <p className="text-xs text-muted">{t.notes}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted hidden md:table-cell">{t.category}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Badge label={t.type} type={t.type} />
                      </td>
                      <td className={`px-4 py-3 text-right text-sm font-medium ${t.type === 'income' ? 'text-accent-3' : 'text-accent-2'}`}>
                        {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setEditing(t); setShowForm(true); }}
                            className="text-muted hover:text-accent transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteId(t.id)}
                            className="text-muted hover:text-accent-2 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 pb-4">
              <Pagination page={page} totalPages={totalPages} onPage={setPage} />
            </div>
          </>
        ) : (
          <EmptyState message="No transactions found" />
        )}
      </div>

      {showForm && (
        <TransactionForm
          onClose={() => { setShowForm(false); setEditing(undefined); }}
          editing={editing}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          message="Delete this transaction? This cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
};
