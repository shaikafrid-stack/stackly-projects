import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = { Pending: '#f59e0b', Approved: '#22c55e', Rejected: '#ef4444' };

export default function ApprovalStatusChart({ data }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-slate-800 mb-4">Pending vs Approved Invoices</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="approval_status" cx="50%" cy="50%" outerRadius={90} label>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={COLORS[entry.approval_status] || '#94a3b8'} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
