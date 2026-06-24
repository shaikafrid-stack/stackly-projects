import React, { useState } from 'react';
import { leaveAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { PageHeader } from '../../components/shared/UIComponents';
import { Send } from 'lucide-react';

const LEAVE_TYPES = ['SICK', 'CASUAL', 'ANNUAL', 'MATERNITY', 'PATERNITY', 'UNPAID'];

export default function ApplyLeave() {
  const [form, setForm] = useState({ leaveType: '', startDate: '', endDate: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.leaveType) e.leaveType = 'Leave type is required';
    if (!form.startDate) e.startDate = 'Start date is required';
    if (!form.endDate) e.endDate = 'End date is required';
    if (form.startDate && form.endDate && form.endDate < form.startDate) e.endDate = 'End date must be after start date';
    if (!form.reason.trim()) e.reason = 'Reason is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await leaveAPI.apply(form);
      toast.success('Leave request submitted!');
      setForm({ leaveType: '', startDate: '', endDate: '', reason: '' });
      setErrors({});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit leave');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, error, children }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );

  return (
    <div>
      <PageHeader title="Apply for Leave" subtitle="Submit a new leave request" />
      <div className="max-w-xl bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Leave Type" error={errors.leaveType}>
            <select value={form.leaveType} onChange={e => setForm({...form, leaveType: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select type...</option>
              {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date" error={errors.startDate}>
              <input type="date" value={form.startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm({...form, startDate: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </Field>
            <Field label="End Date" error={errors.endDate}>
              <input type="date" value={form.endDate}
                min={form.startDate || new Date().toISOString().split('T')[0]}
                onChange={e => setForm({...form, endDate: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </Field>
          </div>

          <Field label="Reason" error={errors.reason}>
            <textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})}
              rows={4} placeholder="Explain the reason for your leave..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </Field>

          <button type="submit" disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium">
            <Send size={16} />
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
