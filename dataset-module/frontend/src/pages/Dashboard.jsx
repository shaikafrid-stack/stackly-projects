import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { getDashboard } from '../api/datasets';

const COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Dashboard</h1>

        {loading && <LoadingState label="Loading dashboard..." />}
        {error && <ErrorState message={error} />}

        {data && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <Card title="Total Datasets" value={data.totals.total_datasets} />
              <Card title="Processed" value={data.totals.processed} />
              <Card title="Pending" value={data.totals.pending_processing} />
              <Card title="Validation Failed" value={data.totals.validation_failed} />
              <Card title="Processing Failed" value={data.totals.processing_failed} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h2 className="text-sm font-medium text-gray-700 mb-4">Datasets by Status</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.datasets_by_status}>
                    <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h2 className="text-sm font-medium text-gray-700 mb-4">Datasets by File Type</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={data.datasets_by_file_type} dataKey="count" nameKey="file_type" outerRadius={90} label>
                      {data.datasets_by_file_type.map((entry, i) => (
                        <Cell key={entry.file_type} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-5 mt-6">
              <h2 className="text-sm font-medium text-gray-700 mb-4">Recent Datasets</h2>
              <ul className="divide-y divide-gray-100">
                {data.recent_datasets.map((d) => (
                  <li key={d.id} className="py-2 flex justify-between text-sm">
                    <span className="text-gray-700">{d.name}</span>
                    <span className="text-gray-400">{d.status}</span>
                  </li>
                ))}
                {data.recent_datasets.length === 0 && <p className="text-sm text-gray-400">No datasets yet.</p>}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
