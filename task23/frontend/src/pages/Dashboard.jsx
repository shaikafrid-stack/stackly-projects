import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import SummaryCard from '../components/SummaryCard.jsx';

const COLORS = ['#3860f0', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const endpointByRole = {
  Administrator: '/dashboard/admin',
  'Data Steward': '/dashboard/steward',
  'Data Analyst': '/dashboard/analyst',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint = endpointByRole[user.role];
        const { data } = await api.get(endpoint);
        setData(data);
      } catch (err) {
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.role]);

  if (loading) return <p className="text-slate-400">Loading dashboard...</p>;
  if (!data) return <p className="text-slate-400">No data available.</p>;

  const { cards, charts } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <SummaryCard label="Total Datasets" value={cards.totalDatasets} />
        {cards.published !== undefined && <SummaryCard label="Published" value={cards.published} accent="text-emerald-600" />}
        {cards.draft !== undefined && <SummaryCard label="Draft" value={cards.draft} accent="text-amber-600" />}
        {cards.archived !== undefined && <SummaryCard label="Archived" value={cards.archived} accent="text-slate-500" />}
        {cards.totalWorkspaces !== undefined && <SummaryCard label="Workspaces" value={cards.totalWorkspaces} accent="text-purple-600" />}
        {cards.favorites !== undefined && <SummaryCard label="My Favorites" value={cards.favorites} accent="text-pink-600" />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.byCategory && (
          <div className="card">
            <h3 className="font-semibold mb-4">Datasets by Category</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={charts.byCategory} dataKey="count" nameKey="category" outerRadius={100} label>
                  {charts.byCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {charts.byStatus && (
          <div className="card">
            <h3 className="font-semibold mb-4">Dataset Status Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={charts.byStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3860f0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {charts.byWorkspace && (
          <div className="card">
            <h3 className="font-semibold mb-4">Workspace-wise Dataset Count</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={charts.byWorkspace}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="workspace_name" hide={false} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {charts.monthlyTrend && (
          <div className="card">
            <h3 className="font-semibold mb-4">Monthly Dataset Creation Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={charts.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
