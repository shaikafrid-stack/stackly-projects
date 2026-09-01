import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { StatCard, Card } from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import { getDashboard } from '../api/datasets';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';

const SEVERITY_COLORS = { HIGH: '#f43f5e', WARNING: '#f59e0b', LOW: '#94a3b8' };
const TYPE_COLORS = ['#3b5fe0', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data.data))
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Data Quality Dashboard">
      {loading && <Loader label="Loading dashboard..." />}
      {error && <p className="text-rose-600">{error}</p>}
      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard label="Total Datasets" value={data.summary.totalDatasets} icon="🗂️" />
            <StatCard label="Profiled Datasets" value={data.summary.profiledDatasets} icon="✅" />
            <StatCard label="Total Rows" value={data.summary.totalRows.toLocaleString()} icon="📈" />
            <StatCard label="Quality Issues" value={data.summary.totalIssues} icon="⚠️" />
            <StatCard
              label="Avg Quality Score"
              value={`${data.summary.avgQualityScore}%`}
              tone={data.summary.avgQualityScore >= 85 ? 'good' : data.summary.avgQualityScore >= 60 ? 'warning' : 'poor'}
              icon="🎯"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-semibold text-slate-700 mb-4">Quality Issues by Severity</h3>
              {Object.values(data.issuesBySeverity).every((v) => v === 0) ? (
                <p className="text-sm text-slate-400 py-10 text-center">No quality issues recorded yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={Object.entries(data.issuesBySeverity).map(([name, value]) => ({ name, value }))}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {Object.keys(data.issuesBySeverity).map((k) => (
                        <Cell key={k} fill={SEVERITY_COLORS[k]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card>
              <h3 className="font-semibold text-slate-700 mb-4">Data Types Distribution</h3>
              {Object.keys(data.typeDistribution).length === 0 ? (
                <p className="text-sm text-slate-400 py-10 text-center">No column data yet. Run profiling on a dataset.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={Object.entries(data.typeDistribution).map(([name, value]) => ({ name, value }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {Object.keys(data.typeDistribution).map((_, i) => (
                        <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          <Card>
            <h3 className="font-semibold text-slate-700 mb-4">Recently Profiled Datasets</h3>
            {data.recentProfiles.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No datasets have been profiled yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.recentProfiles.map((p) => (
                  <Link
                    to={`/datasets/${p.datasetId}`}
                    key={p.id}
                    className="flex items-center justify-between py-3 hover:bg-slate-50 px-2 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-slate-700 text-sm">{p.Dataset?.name || `Dataset #${p.datasetId}`}</p>
                      <p className="text-xs text-slate-400">{new Date(p.profiledAt).toLocaleString()}</p>
                    </div>
                    <span className="text-sm font-semibold text-brand-600">{p.qualityScore}%</span>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
