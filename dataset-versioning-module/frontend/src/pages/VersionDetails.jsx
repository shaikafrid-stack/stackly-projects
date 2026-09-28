import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { versionApi } from '../api/api';
import { Loader, ErrorBanner } from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['Draft', 'Active', 'Archived', 'Restored'];

export default function VersionDetails() {
  const { versionId } = useParams();
  const { can, user } = useAuth();
  const [version, setVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    versionApi
      .getDetails(versionId)
      .then((res) => setVersion(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load version'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [versionId]);

  async function handleStatusChange(newStatus) {
    setUpdating(true);
    try {
      await versionApi.updateStatus(versionId, newStatus, user?.username);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <Loader label="Loading version details…" />;
  if (error) return <ErrorBanner message={error} onRetry={load} />;
  if (!version) return null;

  const columns = version.schema?.columns || [];

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Version</p>
            <h2 className="text-xl font-bold text-slate-900">
              v{version.version_number} — {version.version_label}
            </h2>
            <p className="text-sm text-slate-500 mt-1">{version.change_summary}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={version.status} />
            {can('Admin', 'Data Steward') && (
              <select
                className="input py-1.5 text-xs"
                value=""
                disabled={updating}
                onChange={(e) => e.target.value && handleStatusChange(e.target.value)}
              >
                <option value="">Change status…</option>
                {STATUS_OPTIONS.filter((s) => s !== version.status).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-400">Created By</dt>
            <dd className="text-sm text-slate-700 mt-0.5">{version.created_by}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-400">Created At</dt>
            <dd className="text-sm text-slate-700 mt-0.5">{new Date(version.created_at).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-400">Record Count</dt>
            <dd className="text-sm text-slate-700 mt-0.5">{version.record_count}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-400">Parent Version</dt>
            <dd className="text-sm text-slate-700 mt-0.5">
              {version.parent_version_id ? (
                <Link to={`/versions/${version.parent_version_id}`} className="text-brand-600 hover:underline">
                  #{version.parent_version_id}
                </Link>
              ) : (
                '— (root version)'
              )}
            </dd>
          </div>
        </dl>
      </div>

      <div className="card p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Schema Snapshot</h3>
        {columns.length === 0 ? (
          <p className="text-sm text-slate-400">No column metadata recorded for this version.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-slate-400 text-xs uppercase">
              <tr>
                <th className="text-left py-2">Column</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Nullable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {columns.map((c) => (
                <tr key={c.name}>
                  <td className="py-2 font-medium text-slate-700">{c.name}</td>
                  <td className="py-2 text-slate-500">{c.type}</td>
                  <td className="py-2 text-slate-500">{c.nullable ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Changes in this Version</h3>
        {version.changeLog.length === 0 ? (
          <p className="text-sm text-slate-400">No granular change-log entries for this version.</p>
        ) : (
          <ul className="space-y-3">
            {version.changeLog.map((c) => (
              <li key={c.id} className="flex gap-3 text-sm">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />
                <div>
                  <p className="text-slate-700">{c.description}</p>
                  <p className="text-xs text-slate-400">
                    {c.change_type} · {c.changed_by} · {new Date(c.changed_at).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
