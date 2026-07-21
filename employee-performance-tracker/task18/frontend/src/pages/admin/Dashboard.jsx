import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import Spinner from '../../components/Spinner';
import ErrorBanner from '../../components/ErrorBanner';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    api.get('/dashboard/admin')
      .then((res) => mounted && setData(res.data))
      .catch((err) => mounted && setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) return <Spinner label="Loading dashboard..." />;
  if (error) return <ErrorBanner message={error} />;

  const chartData = data.department_performance.map((d) => ({
    department: d.department || 'Unassigned',
    completed: d.completed_goals || 0,
    total: d.total_goals || 0,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Employees" value={data.total_employees} />
        <StatCard label="Goal Completion Rate" value={data.goal_completion_rate} accent="green" />
        <StatCard label="Avg. Performance Rating" value={data.average_performance_rating ?? '—'} accent="brand" />
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Department Performance Overview</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="department" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#c7d2fe" name="Total Goals" />
              <Bar dataKey="completed" fill="#4f46e5" name="Completed Goals" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="font-semibold mb-3">Department Breakdown</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
              <th className="py-2 pr-4">Department</th>
              <th className="py-2 pr-4">Total Goals</th>
              <th className="py-2 pr-4">Completed</th>
              <th className="py-2 pr-4">Avg. Progress</th>
              <th className="py-2 pr-4">Avg. Rating</th>
            </tr>
          </thead>
          <tbody>
            {data.department_performance.map((d, i) => (
              <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4">{d.department || 'Unassigned'}</td>
                <td className="py-2 pr-4">{d.total_goals || 0}</td>
                <td className="py-2 pr-4">{d.completed_goals || 0}</td>
                <td className="py-2 pr-4">{d.avg_progress ?? 0}%</td>
                <td className="py-2 pr-4">{d.avg_rating ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
