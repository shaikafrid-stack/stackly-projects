import React, { useState } from 'react';
import { Download, Trash2, Plus, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ConfirmDialog, PageHeader } from '../components/UI';
import { exportToCSV } from '../utils/csvExport';
import { CURRENCIES } from '../utils/constants';

export const Settings: React.FC = () => {
  const { state, dispatch } = useApp();
  const [newCategory, setNewCategory] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState<string | null>(null);

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !state.categories.includes(trimmed)) {
      dispatch({ type: 'ADD_CATEGORY', payload: trimmed });
      setNewCategory('');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage your preferences and data" />

      {/* Currency */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-text mb-4">Currency</h3>
        <div className="flex gap-2">
          {CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => dispatch({ type: 'SET_CURRENCY', payload: c })}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                state.currency === c
                  ? 'bg-accent/20 border-accent text-accent'
                  : 'border-border text-muted hover:text-text'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-text mb-4">Categories</h3>
        <div className="flex gap-2 mb-4">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            placeholder="New category name"
            className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-accent"
          />
          <button
            onClick={handleAddCategory}
            className="flex items-center gap-1 bg-accent hover:bg-accent/80 text-white px-3 py-2 rounded-lg text-sm font-medium"
          >
            <Plus size={14} /> Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {state.categories.map((c) => (
            <div key={c} className="flex items-center gap-1 bg-surface border border-border rounded-full px-3 py-1">
              <span className="text-sm text-text">{c}</span>
              <button
                onClick={() => setDeleteCategory(c)}
                className="text-muted hover:text-accent-2 ml-1"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-medium text-text mb-2">Data Management</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => exportToCSV(state.transactions, state.currency)}
            className="flex items-center gap-2 bg-accent-3/20 border border-accent-3/30 text-accent-3 hover:bg-accent-3/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={16} /> Export Transactions CSV
          </button>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 bg-accent-2/20 border border-accent-2/30 text-accent-2 hover:bg-accent-2/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Trash2 size={16} /> Clear All Data
          </button>
        </div>
        <p className="text-xs text-muted">
          {state.transactions.length} transactions · {state.budgetGoals.length} budget goals
        </p>
      </div>

      {showClearConfirm && (
        <ConfirmDialog
          message="This will permanently delete all transactions, budget goals, and reset settings. This cannot be undone."
          onConfirm={() => {
            dispatch({ type: 'CLEAR_ALL_DATA' });
            setShowClearConfirm(false);
          }}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}

      {deleteCategory && (
        <ConfirmDialog
          message={`Remove category "${deleteCategory}"? Existing transactions will keep their category.`}
          onConfirm={() => {
            dispatch({ type: 'REMOVE_CATEGORY', payload: deleteCategory });
            setDeleteCategory(null);
          }}
          onCancel={() => setDeleteCategory(null)}
        />
      )}
    </div>
  );
};
