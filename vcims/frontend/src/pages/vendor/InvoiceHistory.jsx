import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce';
import { formatCurrency, formatDate } from '../../utils/format';

export default function InvoiceHistory() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get('/invoices', { params: { search: debouncedSearch, approval_status: approvalStatus, payment_status: paymentStatus, page, limit: 8 } })
      .then((res) => {
        setInvoices(res.data.data);
        setPagination(res.data.pagination);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load invoices.'))
      .finally(() => setLoading(false));
  }, [debouncedSearch, approvalStatus, paymentStatus, page]);

  return (
    <DashboardLayout>
      <h2 className="text-xl font-bold text-slate-800 mb-4">Invoice History</h2>

      <div className="card mb-4 flex flex-col sm:flex-row gap-3">
        <input
          className="input sm:max-w-xs"
          placeholder="Search by invoice #..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select className="input sm:max-w-[180px]" value={approvalStatus} onChange={(e) => { setApprovalStatus(e.target.value); setPage(1); }}>
          <option value="">All Approval Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <select className="input sm:max-w-[180px]" value={paymentStatus} onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}>
          <option value="">All Payment Statuses</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partially Paid">Partially Paid</option>
          <option value="Paid">Paid</option>
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
                <th className="py-2 pr-4">Contract</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Invoice Date</th>
                <th className="py-2 pr-4">Due Date</th>
                <th className="py-2 pr-4">Approval</th>
                <th className="py-2 pr-4">Payment</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 && (
                <tr><td colSpan="7" className="py-6 text-center text-slate-400">No invoices found.</td></tr>
              )}
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-medium text-slate-700">{inv.invoice_number}</td>
                  <td className="py-2 pr-4">{inv.contract_title}</td>
                  <td className="py-2 pr-4">{formatCurrency(inv.invoice_amount)}</td>
                  <td className="py-2 pr-4">{formatDate(inv.invoice_date)}</td>
                  <td className="py-2 pr-4">{formatDate(inv.due_date)}</td>
                  <td className="py-2 pr-4"><StatusBadge status={inv.approval_status} /></td>
                  <td className="py-2 pr-4"><StatusBadge status={inv.payment_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
        </div>
      )}
    </DashboardLayout>
  );
}
