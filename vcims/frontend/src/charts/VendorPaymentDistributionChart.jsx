import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/format';

export default function VendorPaymentDistributionChart({ data }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-slate-800 mb-4">Vendor-wise Payment Distribution</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="vendor_name" tick={{ fontSize: 12 }} width={120} />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Bar dataKey="total_paid" name="Total Paid" fill="#22c55e" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
