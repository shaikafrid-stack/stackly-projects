import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/format';

export default function TopVendorsChart({ data }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-slate-800 mb-4">Top Vendors by Contract Value</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="vendor_name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Bar dataKey="total_value" name="Contract Value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
