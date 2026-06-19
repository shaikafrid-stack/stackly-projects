import React, { memo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { MonthlyRevenue } from '../../types';
import { formatCurrency } from '../../utils';

interface Props { data: MonthlyRevenue[]; }

export const RevenueAreaChart = memo(({ data }: Props) => (
  <div className="chart-card">
    <h3 className="chart-title">Revenue vs Expenses</h3>
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id="colRev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colExp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
        <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
        <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ background:'#1e293b', border:'1px solid #334155', borderRadius:8, color:'#e2e8f0' }} />
        <Legend />
        <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#colRev)" name="Revenue" strokeWidth={2} />
        <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#colExp)" name="Expenses" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
));
