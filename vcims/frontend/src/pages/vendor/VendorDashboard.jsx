import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import SummaryCard from '../../components/SummaryCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';

export default function VendorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/vendor')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <h2 className="text-xl font-bold text-slate-800 mb-4">My Overview</h2>
      <ErrorMessage message={error} />
      {loading || !data ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <SummaryCard label="Contracts" value={data.summary.contractCount} icon="📄" />
            <SummaryCard label="Invoices" value={data.summary.invoiceCount} icon="🧾" />
            <SummaryCard label="Invoiced" value={formatCurrency(data.summary.totalInvoiced)} icon="💰" accent="amber" />
            <SummaryCard label="Received" value={formatCurrency(data.summary.totalReceived)} icon="✅" accent="green" />
            <SummaryCard label="Outstanding" value={formatCurrency(data.summary.outstanding)} icon="⏳" accent="red" />
          </div>

          <div className="card overflow-x-auto">
            <h3 className="font-semibold text-slate-800 mb-4">Recent Invoices</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4">Invoice #</th>
                  <th className="py-2 pr-4">Contract</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Approval</th>
                  <th className="py-2 pr-4">Payment</th>
                  <th className="py-2 pr-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentInvoices.length === 0 && (
                  <tr><td colSpan="6" className="py-6 text-center text-slate-400">No invoices yet.</td></tr>
                )}
                {data.recentInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-medium text-slate-700">{inv.invoice_number}</td>
                    <td className="py-2 pr-4">{inv.contract_title}</td>
                    <td className="py-2 pr-4">{formatCurrency(inv.invoice_amount)}</td>
                    <td className="py-2 pr-4"><StatusBadge status={inv.approval_status} /></td>
                    <td className="py-2 pr-4"><StatusBadge status={inv.payment_status} /></td>
                    <td className="py-2 pr-4">{formatDate(inv.invoice_date)}</td>
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
