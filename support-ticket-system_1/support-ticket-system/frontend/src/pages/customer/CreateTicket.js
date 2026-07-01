import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createTicket } from '../../services/api';

const categories = ['Authentication', 'Billing', 'Bug', 'Feature Request', 'Performance', 'Account', 'Other'];

export default function CreateTicket() {
  const [form, setForm] = useState({ ticket_title: '', ticket_description: '', priority: 'medium', category: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.ticket_title.trim()) e.ticket_title = 'Title is required';
    if (!form.ticket_description.trim()) e.ticket_description = 'Description is required';
    else if (form.ticket_description.length < 10) e.ticket_description = 'Please provide more detail (min 10 characters)';
    if (!form.category) e.category = 'Select a category';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await createTicket(form);
      toast.success('Ticket created successfully!');
      navigate(`/tickets/${res.data.ticket.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ticket');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Create a support ticket</h1>
      <p className="text-sm text-gray-500 mb-6">Describe your issue and we'll get back to you according to SLA.</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5" noValidate>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input value={form.ticket_title} onChange={e => setForm({...form, ticket_title: e.target.value})}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.ticket_title ? 'border-red-300' : 'border-gray-300'}`}
            placeholder="Brief summary of the issue" />
          {errors.ticket_title && <p className="text-xs text-red-600 mt-1">{errors.ticket_title}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.category ? 'border-red-300' : 'border-gray-300'}`}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea rows={6} value={form.ticket_description} onChange={e => setForm({...form, ticket_description: e.target.value})}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.ticket_description ? 'border-red-300' : 'border-gray-300'}`}
            placeholder="Provide as much detail as possible..." />
          {errors.ticket_description && <p className="text-xs text-red-600 mt-1">{errors.ticket_description}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-60">
            {loading ? 'Submitting...' : 'Submit Ticket'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="text-gray-600 font-medium px-5 py-2.5 rounded-lg hover:bg-gray-100 transition">Cancel</button>
        </div>
      </form>
    </div>
  );
}
