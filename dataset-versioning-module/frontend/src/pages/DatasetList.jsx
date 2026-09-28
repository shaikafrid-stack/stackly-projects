import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { datasetApi } from '../api/api';
import { Loader, ErrorBanner, EmptyState } from '../components/Loader';
import { useAuth } from '../context/AuthContext';

export default function DatasetList() {
  const { can } = useAuth();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', recordCount: 0 });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    datasetApi
      .list()
      .then((res) => setDatasets(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load datasets'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = datasets.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

  async function handleCreate(e) {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) {
      setFormError('Dataset name is required');
      return;
    }
    setSubmitting(true);
    try {
      await datasetApi.create({ ...form, createdBy: JSON.parse(localStorage.getItem('dv_user'))?.username });
      setShowCreate(false);
      setForm({ name: '', description: '', recordCount: 0 });
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create dataset');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <input
          className="input sm:max-w-xs"
          placeholder="Search datasets…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {can('Admin', 'Data Steward') && (
          <button className="btn-primary" onClick={() => setShowCreate((s) => !s)}>
            + New Dataset
          </button>
        )}
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="card p-5 grid gap-3 sm:grid-cols-2">
          {formError && (
            <div className="sm:col-span-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 text-sm">
              {formError}
            </div>
          )}
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Initial Record Count</label>
            <input
              type="number"
              className="input"
              value={form.recordCount}
              onChange={(e) => setForm({ ...form, recordCount: Number(e.target.value) })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2 flex gap-2 justify-end">
            <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Dataset (v1)'}
            </button>
          </div>
        </form>
      )}

      {loading && <Loader label="Loading datasets…" />}
      {error && <ErrorBanner message={error} onRetry={load} />}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState title="No datasets found" description="Try a different search, or create a new dataset." />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-slate-50 to-brand-50/40 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-bold">Dataset</th>
                <th className="text-left px-4 py-3 font-bold">Active Version</th>
                <th className="text-left px-4 py-3 font-bold">Record Count</th>
                <th className="text-left px-4 py-3 font-bold">Total Versions</th>
                <th className="text-left px-4 py-3 font-bold">Last Updated</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-brand-50/40 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white flex items-center justify-center text-xs font-bold">
                        {d.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800">{d.name}</p>
                        <p className="text-xs text-slate-400 line-clamp-1">{d.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="chip bg-brand-50 text-brand-700">
                      {d.active_version_number ? `v${d.active_version_number}` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 font-medium">{d.active_record_count ?? '—'}</td>
                  <td className="px-4 py-3.5 text-slate-600">{d.total_versions}</td>
                  <td className="px-4 py-3.5 text-slate-500">
                    {d.active_version_created_at ? new Date(d.active_version_created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Link to={`/datasets/${d.id}`} className="text-brand-600 font-semibold hover:underline">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
