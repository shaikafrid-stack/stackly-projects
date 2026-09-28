import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { versionApi } from '../api/api';
import { Loader, ErrorBanner, EmptyState } from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';

export default function VersionHistory() {
  const { datasetId } = useParams();
  const { can, user } = useAuth();
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ versionLabel: '', changeSummary: '', recordCount: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    versionApi
      .listForDataset(datasetId)
      .then((res) => setVersions(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load versions'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [datasetId]);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError('');
    if (!form.changeSummary.trim()) {
      setFormError('Change summary is required');
      return;
    }
    setSubmitting(true);
    try {
      await versionApi.create(datasetId, {
        versionLabel: form.versionLabel || undefined,
        changeSummary: form.changeSummary,
        recordCount: form.recordCount ? Number(form.recordCount) : undefined,
        createdBy: user?.username,
      });
      setShowCreate(false);
      setForm({ versionLabel: '', changeSummary: '', recordCount: '' });
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create version');
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmRestore() {
    setRestoring(true);
    setRestoreError('');
    try {
      await versionApi.restore(restoreTarget.id, user?.username);
      setRestoreTarget(null);
      load();
    } catch (err) {
      setRestoreError(err.response?.data?.message || 'Restore failed');
    } finally {
      setRestoring(false);
    }
  }

  const latestVersionNumber = versions[0]?.version_number;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Version History</h2>
        {can('Admin', 'Data Steward') && (
          <button className="btn-primary" onClick={() => setShowCreate((s) => !s)}>
            + New Version
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
            <label className="label">Version Label (optional)</label>
            <input
              className="input"
              placeholder={`v${(latestVersionNumber || 0) + 1}`}
              value={form.versionLabel}
              onChange={(e) => setForm({ ...form, versionLabel: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Record Count (optional)</label>
            <input
              type="number"
              className="input"
              value={form.recordCount}
              onChange={(e) => setForm({ ...form, recordCount: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Change Summary</label>
            <textarea
              className="input"
              rows={2}
              value={form.changeSummary}
              onChange={(e) => setForm({ ...form, changeSummary: e.target.value })}
              placeholder="e.g. Added region column, removed 12 duplicate records"
              required
            />
          </div>
          <div className="sm:col-span-2 flex gap-2 justify-end">
            <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Version'}
            </button>
          </div>
        </form>
      )}

      {loading && <Loader label="Loading version history…" />}
      {error && <ErrorBanner message={error} onRetry={load} />}
      {!loading && !error && versions.length === 0 && <EmptyState title="No versions yet" />}

      {!loading && !error && versions.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Version</th>
                <th className="text-left px-4 py-3 font-semibold">Created</th>
                <th className="text-left px-4 py-3 font-semibold">Created By</th>
                <th className="text-left px-4 py-3 font-semibold">Change Description</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Records</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {versions.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">v{v.version_number}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(v.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-600">{v.created_by}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{v.change_summary}</td>
                  <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                  <td className="px-4 py-3 text-slate-600">{v.record_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <Link to={`/versions/${v.id}`} className="text-brand-600 font-medium hover:underline">
                        Details
                      </Link>
                      {can('Admin') && v.version_number !== latestVersionNumber && (
                        <button
                          onClick={() => setRestoreTarget(v)}
                          className="text-amber-600 font-medium hover:underline"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!restoreTarget}
        title={`Restore version ${restoreTarget?.version_number}?`}
        description={`This will create a NEW version (v${(latestVersionNumber || 0) + 1}) using the contents of v${restoreTarget?.version_number}. Newer versions will be preserved, not deleted or overwritten.`}
        confirmLabel="Restore Version"
        tone="danger"
        loading={restoring}
        onCancel={() => {
          setRestoreTarget(null);
          setRestoreError('');
        }}
        onConfirm={confirmRestore}
      >
        {restoreError && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 text-sm">
            {restoreError}
          </div>
        )}
      </ConfirmModal>
    </div>
  );
}
