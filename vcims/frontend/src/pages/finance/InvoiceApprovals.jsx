import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce';
import { formatCurrency, formatDate } from '../../utils/format';

export default function InvoiceApprovals() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('Pending');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [comment, setComment] = useState('');
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject'
  const [actionError, setActionError] = useState('');
  const [processing, setProcessing] = useState(false);

  const debouncedSearch = useDebounce(search);

  const loadInvoices = () => {
    setLoading(true);
    setError('');
    api.get('/invoices', { params: { search: debouncedSearch, approval_status: approvalStatus, page, limit: 8 } })
      .then((res) => {
        setInvoices(res.data.data);
        setPagination(res.data.pagination);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load invoices.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadInvoices(); /* eslint-disable-next-line */ }, [debouncedSearch, approvalStatus, page]);

  const openAction = (invoice, type) => {
    setActiveInvoice(invoice);
    setActionType(type);
    setComment('');
    setActionError('');
  };

  const closeAction = () => {
    setActiveInvoice(null);
    setActionType(null);
  };

  const handleConfirm = async () => {
    setProcessing(true);
    setActionError('');
    try {
      await api.put(`/invoices/${activeInvoice.id}/${actionType}`, { comment });
      closeAction();
      loadInvoices();
    } catch (err) {
      setActionError(err.response?.data?.message || `Failed to ${actionType} invoice.`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <h2 className="text-xl font-bold text-slate-800 mb-4">Invoice Approval Dashboard</h2>

      <div className="card mb-4 flex flex-col sm:flex-row gap-3">
        <input
          className="input sm:max-w-xs"
          placeholder="Search by invoice # or vendor..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select className="input sm:max-w-[180px]" value={approvalStatus} onChange={(e) => { setApprovalStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
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
                <th className="py-2 pr-4">Contract</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Invoice Date</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 && (
                <tr><td colSpan="7" className="py-6 text-center text-slate-400">No invoices found.</td></tr>
              )}
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-medium text-slate-700">{inv.invoice_number}</td>
                  <td className="py-2 pr-4">{inv.vendor_name}</td>
                  <td className="py-2 pr-4">{inv.contract_title}</td>
                  <td className="py-2 pr-4">{formatCurrency(inv.invoice_amount)}</td>
                  <td className="py-2 pr-4">{formatDate(inv.invoice_date)}</td>
                  <td className="py-2 pr-4"><StatusBadge status={inv.approval_status} /></td>
                  <td className="py-2 pr-4 space-x-2">
                    {inv.approval_status === 'Pending' ? (
                      <>
                        <button className="text-green-600 font-medium" onClick={() => openAction(inv, 'approve')}>Approve</button>
                        <button className="text-red-600 font-medium" onClick={() => openAction(inv, 'reject')}>Reject</button>
                      </>
                    ) : (
                      <span className="text-slate-400">No action needed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
        </div>
      )}

      {activeInvoice && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-lg text-slate-800 mb-1">
              {actionType === 'approve' ? 'Approve' : 'Reject'} Invoice {activeInvoice.invoice_number}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Vendor: {activeInvoice.vendor_name} • Amount: {formatCurrency(activeInvoice.invoice_amount)}
            </p>
            <ErrorMessage message={actionError} />
            <label className="label">Comment (optional)</label>
            <textarea
              className="input mb-4"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a note for this decision..."
            />
            <div className="flex justify-end gap-2">
              <button className="btn btn-secondary" onClick={closeAction}>Cancel</button>
              <button
                className={actionType === 'approve' ? 'btn btn-success' : 'btn btn-danger'}
                disabled={processing}
                onClick={handleConfirm}
              >
                {processing ? 'Processing...' : actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
