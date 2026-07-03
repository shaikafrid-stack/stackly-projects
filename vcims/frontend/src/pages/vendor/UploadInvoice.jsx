import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import ErrorMessage from '../../components/ErrorMessage';
import api from '../../services/api';

export default function UploadInvoice() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [form, setForm] = useState({
    contract_id: '', invoice_number: '', invoice_amount: '', invoice_date: '', due_date: '',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/contracts', { params: { limit: 100, status: 'active' } })
      .then((res) => setContracts(res.data.data))
      .catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.contract_id) return 'Please select a contract.';
    if (!form.invoice_number.trim()) return 'Invoice number is required.';
    if (!form.invoice_amount || Number(form.invoice_amount) <= 0) return 'Invoice amount must be greater than 0.';
    if (!form.invoice_date) return 'Invoice date is required.';
    if (!form.due_date) return 'Due date is required.';
    if (new Date(form.due_date) < new Date(form.invoice_date)) return 'Due date cannot be before invoice date.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (file) formData.append('invoice_file', file);

      await api.post('/invoices', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('Invoice submitted successfully! Awaiting finance approval.');
      setTimeout(() => navigate('/vendor/invoices'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <h2 className="text-xl font-bold text-slate-800 mb-4">Upload Invoice</h2>
      <div className="card max-w-xl">
        <ErrorMessage message={error} />
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Contract *</label>
            <select className="input" name="contract_id" value={form.contract_id} onChange={handleChange}>
              <option value="">Select contract</option>
              {contracts.map((c) => <option key={c.id} value={c.id}>{c.contract_title}</option>)}
            </select>
            {contracts.length === 0 && <p className="text-xs text-slate-400 mt-1">No active contracts found. Contact your admin.</p>}
          </div>
          <div>
            <label className="label">Invoice Number *</label>
            <input className="input" name="invoice_number" value={form.invoice_number} onChange={handleChange} placeholder="INV-1001" />
          </div>
          <div>
            <label className="label">Invoice Amount (INR) *</label>
            <input type="number" min="0" className="input" name="invoice_amount" value={form.invoice_amount} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Invoice Date *</label>
              <input type="date" className="input" name="invoice_date" value={form.invoice_date} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Due Date *</label>
              <input type="date" className="input" name="due_date" value={form.due_date} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label className="label">Attach Invoice File (mock upload)</label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="input" onChange={(e) => setFile(e.target.files[0])} />
            <p className="text-xs text-slate-400 mt-1">PDF, JPG or PNG, up to 5MB.</p>
          </div>
          <button type="submit" disabled={submitting} className="btn btn-primary w-full">
            {submitting ? 'Submitting...' : 'Submit Invoice'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
