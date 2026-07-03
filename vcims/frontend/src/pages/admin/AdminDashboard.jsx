import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import SummaryCard from '../../components/SummaryCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import api from '../../services/api';
import { formatCurrency } from '../../utils/format';
import MonthlyInvoiceVolumeChart from '../../charts/MonthlyInvoiceVolumeChart';
import ApprovalStatusChart from '../../charts/ApprovalStatusChart';
import VendorPaymentDistributionChart from '../../charts/VendorPaymentDistributionChart';
import PaymentTrendsChart from '../../charts/PaymentTrendsChart';
import TopVendorsChart from '../../charts/TopVendorsChart';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get('/dashboard/admin')
      .then((res) => { if (mounted) setData(res.data); })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard.'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return (
    <DashboardLayout>
      <h2 className="text-xl font-bold text-slate-800 mb-4">Analytics Dashboard</h2>
      <ErrorMessage message={error} />
      {loading || !data ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <SummaryCard label="Vendors" value={data.summary.vendorCount} icon="🏢" />
            <SummaryCard label="Contracts" value={data.summary.contractCount} icon="📄" />
            <SummaryCard label="Invoices" value={data.summary.invoiceCount} icon="🧾" />
            <SummaryCard label="Total Invoiced" value={formatCurrency(data.summary.totalInvoiced)} icon="💰" accent="amber" />
            <SummaryCard label="Total Paid" value={formatCurrency(data.summary.totalPaid)} icon="✅" accent="green" />
            <SummaryCard label="Outstanding" value={formatCurrency(data.summary.outstanding)} icon="⏳" accent="red" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyInvoiceVolumeChart data={data.monthlyInvoiceVolume} />
            <ApprovalStatusChart data={data.approvalBreakdown} />
            <VendorPaymentDistributionChart data={data.vendorPaymentDistribution} />
            <PaymentTrendsChart data={data.paymentTrends} />
          </div>
          <TopVendorsChart data={data.topVendorsByContractValue} />

          <div className="card overflow-x-auto">
            <h3 className="font-semibold text-slate-800 mb-4">Vendor Performance Metrics</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4">Vendor</th>
                  <th className="py-2 pr-4">Contracts</th>
                  <th className="py-2 pr-4">Invoices</th>
                  <th className="py-2 pr-4">Rejected</th>
                  <th className="py-2 pr-4">Paid</th>
                </tr>
              </thead>
              <tbody>
                {data.vendorPerformance.map((v) => (
                  <tr key={v.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-medium text-slate-700">{v.vendor_name}</td>
                    <td className="py-2 pr-4">{v.total_contracts}</td>
                    <td className="py-2 pr-4">{v.total_invoices}</td>
                    <td className="py-2 pr-4">{v.rejected_invoices}</td>
                    <td className="py-2 pr-4">{v.paid_invoices}</td>
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
