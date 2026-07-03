import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import SummaryCard from '../../components/SummaryCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';

export default function FinanceOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/finance')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <h2 className="text-xl font-bold text-slate-800 mb-4">Finance Overview</h2>
      <ErrorMessage message={error} />
      {loading || !data ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard label="Pending Approval" value={data.summary.pendingCount} icon="⏳" accent="amber" />
            <SummaryCard label="Approved" value={data.summary.approvedCount} icon="✅" accent="green" />
            <SummaryCard label="Rejected" value={data.summary.rejectedCount} icon="❌" accent="red" />
            <SummaryCard label="Outstanding (Approved)" value={formatCurrency(data.summary.outstandingApprovedAmount)} icon="💰" />
          </div>

          <div className="card overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Pending Invoices Needing Review</h3>
              <Link to="/finance/approvals" className="text-sm text-primary-600 font-medium">View all →</Link>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4">Invoice #</th>
                  <th className="py-2 pr-4">Vendor</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Invoice Date</th>
                </tr>
              </thead>
              <tbody>
                {data.pendingInvoices.length === 0 && (
                  <tr><td colSpan="4" className="py-6 text-center text-slate-400">No pending invoices.</td></tr>
                )}
                {data.pendingInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-medium text-slate-700">{inv.invoice_number}</td>
                    <td className="py-2 pr-4">{inv.vendor_name}</td>
                    <td className="py-2 pr-4">{formatCurrency(inv.invoice_amount)}</td>
                    <td className="py-2 pr-4">{formatDate(inv.invoice_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card overflow-x-auto">
            <h3 className="font-semibold text-slate-800 mb-4">Recent Payments</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4">Invoice #</th>
                  <th className="py-2 pr-4">Vendor</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Mode</th>
                  <th className="py-2 pr-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPayments.length === 0 && (
                  <tr><td colSpan="5" className="py-6 text-center text-slate-400">No payments recorded yet.</td></tr>
                )}
                {data.recentPayments.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-medium text-slate-700">{p.invoice_number}</td>
                    <td className="py-2 pr-4">{p.vendor_name}</td>
                    <td className="py-2 pr-4">{formatCurrency(p.payment_amount)}</td>
                    <td className="py-2 pr-4">{p.payment_mode}</td>
                    <td className="py-2 pr-4">{formatDate(p.payment_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
