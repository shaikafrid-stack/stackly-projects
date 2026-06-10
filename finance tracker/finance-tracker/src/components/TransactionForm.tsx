import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Transaction } from '../types';
import { transactionSchema, TransactionFormData } from '../utils/schema';
import { useApp } from '../context/AppContext';

interface Props {
  onClose: () => void;
  editing?: Transaction;
}

export const TransactionForm: React.FC<Props> = ({ onClose, editing }) => {
  const { state, dispatch } = useApp();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    mode: 'onChange',
    defaultValues: editing
      ? {
          description: editing.description,
          amount: editing.amount,
          category: editing.category,
          type: editing.type,
          date: editing.date.slice(0, 10),
          notes: editing.notes ?? '',
        }
      : {
          type: 'expense',
          date: new Date().toISOString().slice(0, 10),
        },
  });

  const onSubmit = (data: TransactionFormData) => {
    if (editing) {
      dispatch({
        type: 'UPDATE_TRANSACTION',
        payload: { ...editing, ...data, date: new Date(data.date).toISOString() },
      });
    } else {
      dispatch({
        type: 'ADD_TRANSACTION',
        payload: {
          id: crypto.randomUUID(),
          ...data,
          date: new Date(data.date).toISOString(),
          createdAt: new Date().toISOString(),
        },
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-text">
            {editing ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-text">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* Type */}
          <div className="flex gap-2">
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setValue('type', t, { shouldValidate: true })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  t === 'expense'
                    ? 'data-[active=true]:bg-accent-2/20 data-[active=true]:text-accent-2 data-[active=true]:border-accent-2'
                    : 'data-[active=true]:bg-accent-3/20 data-[active=true]:text-accent-3 data-[active=true]:border-accent-3'
                } border border-border hover:border-muted`}
                data-active={
                  (editing?.type ?? 'expense') === t ? 'true' : undefined
                }
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <input type="hidden" {...register('type')} />

          {/* Description */}
          <div>
            <label className="text-xs text-muted mb-1 block">Description *</label>
            <input
              {...register('description')}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-accent transition-colors"
              placeholder="What was this for?"
            />
            {errors.description && (
              <p className="text-xs text-accent-2 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs text-muted mb-1 block">Amount *</label>
            <input
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-accent transition-colors"
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="text-xs text-accent-2 mt-1">{errors.amount.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="text-xs text-muted mb-1 block">Category *</label>
            <select
              {...register('category')}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-accent transition-colors"
            >
              <option value="">Select category</option>
              {state.categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-accent-2 mt-1">{errors.category.message}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="text-xs text-muted mb-1 block">Date *</label>
            <input
              type="date"
              {...register('date')}
              max={new Date().toISOString().slice(0, 10)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-accent transition-colors"
            />
            {errors.date && (
              <p className="text-xs text-accent-2 mt-1">{errors.date.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-muted mb-1 block">Notes (optional)</label>
            <textarea
              {...register('notes')}
              rows={2}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-accent transition-colors resize-none"
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-border text-sm text-muted hover:text-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="flex-1 py-2 rounded-lg bg-accent text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/80 transition-colors"
            >
              {editing ? 'Update' : 'Add'} Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
