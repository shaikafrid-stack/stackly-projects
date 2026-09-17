import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import { Database, CheckCircle2, Activity, TrendingUp, XCircle } from 'lucide-react';
import { DashboardAPI } from '../api/endpoints';
import { SummaryCard } from '../components/Widgets';
import { LoadingState, EmptyState } from '../components/Overlay';
import { useAuth } from '../context/AuthContext';

const PIE_COLORS = ['#7c3aed', '#f43f5e'];
const BAR_COLORS = ['#7c3aed', '#a855f7', '#c084fc', '#e879f9', '#f472b6', '#fb7185', '#f59e0b', '#22c55e'];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DashboardAPI.get()
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading dashboard..." />;
  if (!data) return <EmptyState title="Unable to load dashboard" />;

  const { summary, transformationsByType, successVsFailed, activity } = data;

  return (
    <div className="space-y-6">
      <div>
        <p className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</p>
        <p className="page-subtitle">Here's what's happening in your data preparation workspace.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard icon={Database} label="Total Datasets" value={summary.totalDatasets} gradient="from-brand-500 to-indigo-500" />
        <SummaryCard icon={CheckCircle2} label="Prepared Datasets" value={summary.preparedDatasets} gradient="from-emerald-500 to-teal-500" />
        <SummaryCard icon={Activity} label="Transformation Runs" value={summary.transformationRuns} gradient="from-amber-500 to-orange-500" />
        <SummaryCard icon={TrendingUp} label="Successful" value={summary.successfulTransformations} gradient="from-sky-500 to-cyan-500" />
        <SummaryCard icon={XCircle} label="Failed" value={summary.failedTransformations} gradient="from-rose-500 to-pink-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <p className="font-bold text-slate-700 mb-4">Transformations by Type</p>
          {transformationsByType.length === 0 ? (
            <EmptyState title="No transformations run yet" subtitle="Apply transformations to a dataset to see activity here." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={transformationsByType} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="type" width={140} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ fill: '#f5f3ff' }} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {transformationsByType.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <p className="font-bold text-slate-700 mb-4">Successful vs Failed Transformations</p>
          {summary.transformationRuns === 0 ? (
            <EmptyState title="No runs recorded yet" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={successVsFailed} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={4}>
                  {successVsFailed.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5 lg:col-span-2">
          <p className="font-bold text-slate-700 mb-4">Dataset Preparation Activity (Records Processed)</p>
          {activity.length === 0 ? (
            <EmptyState title="No activity yet" subtitle="Once transformations run, daily activity will appear here." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={activity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="runs" stroke="#7c3aed" strokeWidth={2.5} name="Runs" dot={false} />
                <Line type="monotone" dataKey="recordsProcessed" stroke="#ec4899" strokeWidth={2.5} name="Records Processed" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
