import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

/**
 * Modal for creating a goal.
 * mode="employee" -> creates a goal for self
 * mode="manager"  -> creates a goal for a chosen team member (employees prop required)
 */
export default function GoalFormModal({ mode, employees = [], onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    target_date: '',
    employee_id: employees[0]?.id || '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.target_date) errs.target_date = 'Target date is required';
    if (mode === 'manager' && !form.employee_id) errs.employee_id = 'Please select an employee';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        target_date: form.target_date,
      };
      if (mode === 'manager') payload.employee_id = Number(form.employee_id);

      await api.post('/goals', payload);
      toast.success('Goal created successfully');
      onCreated?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create goal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg">
        <h2 className="text-lg font-bold mb-4">Create Goal</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'manager' && (
            <div>
              <label className="label">Assign to</label>
              <select
                className="input"
                value={form.employee_id}
                onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
              {errors.employee_id && <p className="text-red-500 text-xs mt-1">{errors.employee_id}</p>}
            </div>
          )}

          <div>
            <label className="label">Goal Title</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Improve API response times"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Priority</label>
              <select
                className="input"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label className="label">Target Date</label>
              <input
                type="date"
                className="input"
                value={form.target_date}
                onChange={(e) => setForm({ ...form, target_date: e.target.value })}
              />
              {errors.target_date && <p className="text-red-500 text-xs mt-1">{errors.target_date}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
