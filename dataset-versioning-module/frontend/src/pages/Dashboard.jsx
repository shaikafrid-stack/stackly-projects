import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/api';
import { Loader, ErrorBanner } from '../components/Loader';

function StatCard({ label, value, icon, gradient }) {
  return (
    <div className={`stat-card bg-gradient-to-br ${gradient}`}>
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{label}</p>
          <span className="text-xl">{icon}</span>
        </div>
        <p className="mt-3 text-3xl font-extrabold tracking-tight">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError('');
    dashboardApi
      .summary()
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <Loader label="Loading dashboard…" />;
  if (error) return <ErrorBanner message={error} onRetry={load} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Datasets" value={data.totalDatasets} icon="🗂️" gradient="from-brand-500 to-brand-700" />
        <StatCard label="Total Versions" value={data.totalVersions} icon="🕓" gradient="from-violet-500 to-violet-700" />
        <StatCard label="Active Versions" value={data.activeVersions} icon="✅" gradient="from-emerald-500 to-teal-600" />
        <StatCard label="Archived Versions" value={data.archivedVersions} icon="📦" gradient="from-amber-500 to-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="section-heading mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-500" /> Recently Modified Datasets
          </h3>
          {data.recentlyModified.length === 0 && <p className="text-sm text-slate-400">No activity yet.</p>}
          <ul className="divide-y divide-slate-100">
            {data.recentlyModified.map((d) => (
              <li key={d.id} className="py-3 flex items-center justify-between group">
                <Link
                  to={`/datasets/${d.id}`}
                  className="text-sm font-semibold text-slate-700 group-hover:text-brand-600 transition-colors flex items-center gap-2"
                >
                  <span className="h-7 w-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-bold">
                    {d.name.slice(0, 1)}
                  </span>
                  {d.name}
                </Link>
                <span className="text-xs text-slate-400">{new Date(d.last_modified).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <h3 className="section-heading mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent-teal" /> Recent Version Changes
          </h3>
          {data.recentChanges.length === 0 && <p className="text-sm text-slate-400">No changes logged yet.</p>}
          <ul className="divide-y divide-slate-100">
            {data.recentChanges.map((c) => (
              <li key={c.id} className="py-3">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">{c.dataset_name}</span>{' '}
                  <span className="chip bg-brand-50 text-brand-600 ml-1">v{c.version_number}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">{c.description}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {c.changed_by} · {new Date(c.changed_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
