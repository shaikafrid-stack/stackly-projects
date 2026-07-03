import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';

const EMPTY_FORM = { invoice_id: '', payment_amount: '', payment_date: '', payment_mode: 'Bank Transfer', transaction_reference: '' };

export default function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [approvedInvoices, setApprovedInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadPayments = () => {
    setLoading(true);
    setError('');
    api.get('/payments', { params: { page, limit: 8 } })
      .then((res) => {
        setPayments(res.data.data);
        setPagination(res.data.pagination);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load payments.'))
      .finally(() => setLoading(false));
  };

  const loadApprovedInvoices = () => {
    api.get('/invoices', { params: { approval_status: 'Approved', limit: 100 } })
      .then((res) => setApprovedInvoices(res.data.data.filter((i) => i.payment_status !== 'Paid')))
      .catch(() => {});
  };

  useEffect(() => { loadPayments(); /* eslint-disable-next-line */ }, [page]);
  useEffect(() => { loadApprovedInvoices(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const selectedInvoice = approvedInvoices.find((i) => String(i.id) === String(form.invoice_id));

  const validate = () => {
    if (!form.invoice_id) return 'Please select an invoice.';
    if (!form.payment_amount || Number(form.payment_amount) <= 0) return 'Payment amount must be greater than 0.';
    if (!form.payment_date) return 'Payment date is required.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setFormError(validationError); return; }
    setSaving(true);
    setFormError('');
    try {
      await api.post('/payments', form);
      setShowModal(false);
      loadPayments();
      loadApprovedInvoices();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to record payment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">Payment Management</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Record Payment</button>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4">Invoice #</th>
                <th className="py-2 pr-4">Vendor</th>
                <th className="py-2 pr-4">Amount Paid</th>
                <th className="py-2 pr-4">Mode</th>
                <th className="py-2 pr-4">Reference</th>
                <th className="py-2 pr-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr><td colSpan="6" className="py-6 text-center text-slate-400">No payments recorded yet.</td></tr>
              )}
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-medium text-slate-700">{p.invoice_number}</td>
                  <td className="py-2 pr-4">{p.vendor_name}</td>
                  <td className="py-2 pr-4">{formatCurrency(p.payment_amount)}</td>
                  <td className="py-2 pr-4">{p.payment_mode}</td>
                  <td className="py-2 pr-4">{p.transaction_reference || '-'}</td>
                  <td className="py-2 pr-4">{formatDate(p.payment_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-lg text-slate-800 mb-4">Record Payment</h3>
            <ErrorMessage message={formError} />
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="label">Approved Invoice *</label>
                <select className="input" name="invoice_id" value={form.invoice_id} onChange={handleChange}>
                  <option value="">Select invoice</option>
                  {approvedInvoices.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.invoice_number} — {i.vendor_name} ({formatCurrency(i.invoice_amount)})
                    </option>
                  ))}
                </select>
                {approvedInvoices.length === 0 && (
                  <p className="text-xs text-slate-400 mt-1">No approved unpaid invoices available.</p>
                )}
                {selectedInvoice && (
                  <p className="text-xs text-slate-400 mt-1">
                    Current status: <StatusBadge status={selectedInvoice.payment_status} />
                  </p>
                )}
              </div>
              <div>
                <label className="label">Payment Amount (INR) *</label>
                <input type="number" min="0" className="input" name="payment_amount" value={form.payment_amount} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Payment Date *</label>
                <input type="date" className="input" name="payment_date" value={form.payment_date} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Payment Mode</label>
                <select className="input" name="payment_mode" value={form.payment_mode} onChange={handleChange}>
                  <option>Bank Transfer</option>
                  <option>Cheque</option>
                  <option>UPI</option>
                  <option>Card</option>
                  <option>Cash</option>
                </select>
              </div>
              <div>
                <label className="label">Transaction Reference</label>
                <input className="input" name="transaction_reference" value={form.transaction_reference} onChange={handleChange} placeholder="TXN-XXXX" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Record Payment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
