import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import Navbar from '../components/Navbar';
import SummaryCards from '../components/SummaryCards';
import api from '../services/api';

const COLORS = ['#2f7d6b', '#5aa08e', '#84c3b1', '#f0a860', '#e07a5f', '#8ecae6', '#c9cba3'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/admin')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold mb-6">Admin Dashboard</h1>
        {loading ? (
          <div className="text-gray-400 text-sm">Loading dashboard...</div>
        ) : (
          <>
            <SummaryCards summary={data.summary} />
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <h2 className="font-medium mb-4">Expenses by Category</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={data.byCategory} dataKey="total" nameKey="category" outerRadius={90} label={(d) => d.category}>
                      {data.byCategory.map((entry, i) => (
                        <Cell key={entry.category} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <h2 className="font-medium mb-4">Monthly Reimbursed Amount</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={[...data.monthly].reverse()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                    <Bar dataKey="totalReimbursed" fill="#2f7d6b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
