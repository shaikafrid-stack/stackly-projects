import React, { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { MonthlyRevenue } from '../../types';
import { formatCurrency } from '../../utils';

interface Props { data: MonthlyRevenue[]; }

export const RevenueLineChart = memo(({ data }: Props) => (
  <div className="chart-card">
    <h3 className="chart-title">Monthly Revenue Trend</h3>
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
        <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
        <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ background:'#1e293b', border:'1px solid #334155', borderRadius:8, color:'#e2e8f0' }} />
        <Legend />
        <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} name="Revenue" />
        <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={false} name="Expenses" />
        <Line type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2} dot={false} name="Profit" />
      </LineChart>
    </ResponsiveContainer>
  </div>
));
