import React, { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { CategoryData } from '../../types';

interface Props { data: CategoryData[]; }

export const CategoryBarChart = memo(({ data }: Props) => (
  <div className="chart-card">
    <h3 className="chart-title">Orders by Category</h3>
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="category" stroke="#94a3b8" tick={{ fontSize: 11 }} />
        <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={{ background:'#1e293b', border:'1px solid #334155', borderRadius:8, color:'#e2e8f0' }} />
        <Legend />
        <Bar dataKey="orders" fill="#6366f1" name="Orders" radius={[4,4,0,0]} />
        <Bar dataKey="revenue" fill="#22c55e" name="Revenue" radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
));
