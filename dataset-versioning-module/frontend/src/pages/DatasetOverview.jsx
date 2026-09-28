import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { datasetApi } from '../api/api';
import { Loader, ErrorBanner } from '../components/Loader';
import StatusBadge from '../components/StatusBadge';

export default function DatasetOverview() {
  const { datasetId } = useParams();
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    datasetApi
      .get(datasetId)
      .then((res) => setDataset(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dataset'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [datasetId]);

  if (loading) return <Loader label="Loading dataset…" />;
  if (error) return <ErrorBanner message={error} onRetry={load} />;
  if (!dataset) return null;

  const av = dataset.activeVersion;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{dataset.name}</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">{dataset.description || 'No description provided.'}</p>
          </div>
          <StatusBadge status={dataset.status} />
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-400">Created By</dt>
            <dd className="text-sm text-slate-700 mt-0.5">{dataset.created_by}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-400">Created On</dt>
            <dd className="text-sm text-slate-700 mt-0.5">{new Date(dataset.created_at).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-400">Record Count</dt>
            <dd className="text-sm text-slate-700 mt-0.5">{av?.record_count ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-400">Last Updated</dt>
            <dd className="text-sm text-slate-700 mt-0.5">{av ? new Date(av.created_at).toLocaleString() : '—'}</dd>
          </div>
        </dl>
      </div>

      <div className="card p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Current Active Version</h3>
        {av ? (
          <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-800">
                v{av.version_number} — {av.version_label}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{av.change_summary}</p>
            </div>
            <StatusBadge status={av.status} />
          </div>
        ) : (
          <p className="text-sm text-slate-400">No active version.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to={`/datasets/${datasetId}/versions`} className="btn-secondary">🕓 Version History</Link>
        <Link to={`/datasets/${datasetId}/compare`} className="btn-secondary">🔀 Compare Versions</Link>
        <Link to={`/datasets/${datasetId}/lineage`} className="btn-secondary">🌳 View Lineage</Link>
        <Link to={`/datasets/${datasetId}/changes`} className="btn-secondary">📝 Change History</Link>
      </div>
    </div>
  );
}
