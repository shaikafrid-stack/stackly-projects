import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const CATEGORIES = ['Travel', 'Food', 'Accommodation', 'Office Supplies', 'Client Entertainment', 'Software', 'Other'];

export default function ExpenseForm({ existing, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: existing?.title || '',
    category: existing?.category || CATEGORIES[0],
    amount: existing?.amount || '',
    expense_date: existing?.expense_date || '',
    description: existing?.description || '',
    receipt: existing?.receipt || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function validate() {
    const errs = {};
    if (!form.title || form.title.trim().length < 3) errs.title = 'Title must be at least 3 characters.';
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Amount must be a positive number.';
    if (!form.expense_date) errs.expense_date = 'Expense date is required.';
    else if (new Date(form.expense_date) > new Date()) errs.expense_date = 'Date cannot be in the future.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (existing) {
        await api.put(`/expenses/${existing.id}`, form);
        toast.success('Expense updated.');
      } else {
        await api.post('/expenses', form);
        toast.success('Expense submitted.');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save expense.');
    } finally {
      setSaving(false);
    }
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (file) setForm({ ...form, receipt: file.name });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20 px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">{existing ? 'Edit Expense' : 'Submit New Expense'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Expense Title</label>
            <input
              className="input-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Client flight to Mumbai"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                className="input-field"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>
          </div>
          <div>
            <label className="label">Expense Date</label>
            <input
              type="date"
              className="input-field"
              value={form.expense_date}
              onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
            />
            {errors.expense_date && <p className="text-red-500 text-xs mt-1">{errors.expense_date}</p>}
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input-field"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Add any relevant details..."
            />
          </div>
          <div>
            <label className="label">Receipt</label>
            <input type="file" className="input-field" onChange={handleFile} />
            {form.receipt && <p className="text-xs text-gray-500 mt-1">Attached: {form.receipt}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Saving...' : existing ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
