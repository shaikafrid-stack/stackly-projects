import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/admin')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8 text-gray-400 text-sm">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-xl font-semibold">Monthly Expense Reports</h1>

        <div className="card">
          <h2 className="font-medium mb-4">Reimbursement by Month</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 pr-4 font-medium">Month</th>
                <th className="py-2 pr-4 font-medium">Requests</th>
                <th className="py-2 pr-4 font-medium">Total Reimbursed</th>
              </tr>
            </thead>
            <tbody>
              {data.monthly.map((m) => (
                <tr key={m.month} className="border-b border-gray-50">
                  <td className="py-2 pr-4">{m.month}</td>
                  <td className="py-2 pr-4">{m.count}</td>
                  <td className="py-2 pr-4 font-medium">₹{Number(m.totalReimbursed).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2 className="font-medium mb-4">Spend by Category</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 pr-4 font-medium">Category</th>
                <th className="py-2 pr-4 font-medium">Count</th>
                <th className="py-2 pr-4 font-medium">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.byCategory.map((c) => (
                <tr key={c.category} className="border-b border-gray-50">
                  <td className="py-2 pr-4">{c.category}</td>
                  <td className="py-2 pr-4">{c.count}</td>
                  <td className="py-2 pr-4 font-medium">₹{Number(c.total).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2 className="font-medium mb-4">Users by Role</h2>
          <div className="flex gap-6">
            {data.userCounts.map((u) => (
              <div key={u.role} className="text-center">
                <div className="text-2xl font-semibold text-brand-700">{u.count}</div>
                <div className="text-xs text-gray-500 capitalize">{u.role}s</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
