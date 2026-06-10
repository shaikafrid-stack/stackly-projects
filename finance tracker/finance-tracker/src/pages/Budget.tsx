import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useBudget } from '../hooks/useBudget';
import { ProgressBar, EmptyState, ConfirmDialog, PageHeader } from '../components/UI';
import { formatCurrency } from '../utils/formatCurrency';
import { getCurrentMonth } from '../utils/dateHelpers';
import { budgetGoalSchema, BudgetGoalFormData } from '../utils/schema';
import { BudgetGoal } from '../types';

const BudgetForm: React.FC<{
  onClose: () => void;
  editing?: BudgetGoal;
  categories: string[];
}> = ({ onClose, editing, categories }) => {
  const { dispatch } = useApp();
  const { register, handleSubmit, formState: { errors, isValid } } = useForm<BudgetGoalFormData>({
    resolver: zodResolver(budgetGoalSchema),
    mode: 'onChange',
    defaultValues: editing
      ? { category: editing.category, monthlyLimit: editing.monthlyLimit, month: editing.month }
      : { month: getCurrentMonth() },
  });

  const onSubmit = (data: BudgetGoalFormData) => {
    if (editing) {
      dispatch({ type: 'UPDATE_BUDGET_GOAL', payload: { ...editing, ...data } });
    } else {
      dispatch({ type: 'ADD_BUDGET_GOAL', payload: { id: crypto.randomUUID(), ...data } });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-text">{editing ? 'Edit' : 'Add'} Budget Goal</h2>
          <button onClick={onClose} className="text-muted hover:text-text"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-muted mb-1 block">Category *</label>
            <select {...register('category')} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-accent">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-xs text-accent-2 mt-1">{errors.category.message}</p>}
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Monthly Limit *</label>
            <input type="number" step="0.01" {...register('monthlyLimit', { valueAsNumber: true })}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-accent" placeholder="0.00" />
            {errors.monthlyLimit && <p className="text-xs text-accent-2 mt-1">{errors.monthlyLimit.message}</p>}
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Month *</label>
            <input type="month" {...register('month')} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-accent" />
            {errors.month && <p className="text-xs text-accent-2 mt-1">{errors.month.message}</p>}
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-border text-sm text-muted hover:text-text">Cancel</button>
            <button type="submit" disabled={!isValid} className="flex-1 py-2 rounded-lg bg-accent text-white text-sm font-medium disabled:opacity-40">
              {editing ? 'Update' : 'Add'} Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const Budget: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BudgetGoal | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const budgetStatuses = useBudget(state.budgetGoals, state.transactions);
  const fmt = (n: number) => formatCurrency(n, state.currency);

  const overBudget = budgetStatuses.filter((b) => b.isOver);

  return (
    <div>
      <PageHeader
        title="Budget Goals"
        subtitle="Track spending limits by category"
        actions={
          <button
            onClick={() => { setEditing(undefined); setShowForm(true); }}
            className="flex items-center gap-2 bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus size={16} /> Add Goal
          </button>
        }
      />

      {overBudget.length > 0 && (
        <div className="bg-accent-2/10 border border-accent-2/30 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle size={18} className="text-accent-2 flex-shrink-0" />
          <p className="text-sm text-accent-2">
            You're over budget in {overBudget.length} {overBudget.length === 1 ? 'category' : 'categories'}:{' '}
            {overBudget.map((b) => b.goal.category).join(', ')}
          </p>
        </div>
      )}

      {budgetStatuses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetStatuses.map((b) => (
            <div key={b.goal.id} className={`bg-card border rounded-xl p-5 ${b.isOver ? 'border-accent-2/50' : 'border-border'}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-medium text-text">{b.goal.category}</h3>
                  <p className="text-xs text-muted">{b.goal.month}</p>
                </div>
                <div className="flex items-center gap-2">
                  {b.isOver && <AlertTriangle size={14} className="text-accent-2" />}
                  <button onClick={() => { setEditing(b.goal); setShowForm(true); }} className="text-muted hover:text-accent"><Edit2 size={14} /></button>
                  <button onClick={() => setDeleteId(b.goal.id)} className="text-muted hover:text-accent-2"><Trash2 size={14} /></button>
                </div>
              </div>

              <ProgressBar value={b.spent} max={b.goal.monthlyLimit} isOver={b.isOver} />

              <div className="flex justify-between mt-2">
                <span className={`text-sm font-medium ${b.isOver ? 'text-accent-2' : 'text-text'}`}>
                  {fmt(b.spent)} spent
                </span>
                <span className="text-sm text-muted">
                  of {fmt(b.goal.monthlyLimit)}
                </span>
              </div>

              {b.isOver ? (
                <p className="text-xs text-accent-2 mt-1">Over by {fmt(b.spent - b.goal.monthlyLimit)}</p>
              ) : (
                <p className="text-xs text-muted mt-1">{fmt(b.remaining)} remaining ({b.percentage.toFixed(0)}% used)</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl">
          <EmptyState message="No budget goals set. Add one to start tracking." />
        </div>
      )}

      {showForm && (
        <BudgetForm
          onClose={() => { setShowForm(false); setEditing(undefined); }}
          editing={editing}
          categories={state.categories}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          message="Delete this budget goal?"
          onConfirm={() => { dispatch({ type: 'DELETE_BUDGET_GOAL', payload: deleteId }); setDeleteId(null); }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
};
