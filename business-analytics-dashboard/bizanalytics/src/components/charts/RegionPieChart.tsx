import React, { memo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { RegionData } from '../../types';

interface Props { data: RegionData[]; }
const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#06b6d4'];

export const RegionPieChart = memo(({ data }: Props) => (
  <div className="chart-card">
    <h3 className="chart-title">Customer Distribution by Region</h3>
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="customers" nameKey="region" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${((percent ?? 0)*100).toFixed(0)}%`} labelLine={false}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ background:'#1e293b', border:'1px solid #334155', borderRadius:8, color:'#e2e8f0' }} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
));
