import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { versionApi } from '../api/api';
import { Loader, ErrorBanner, EmptyState } from '../components/Loader';

function DiffPill({ type, text }) {
  const styles = {
    added: 'bg-emerald-50 text-emerald-700',
    removed: 'bg-rose-50 text-rose-700',
    changed: 'bg-amber-50 text-amber-700',
  };
  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium mr-1.5 mb-1.5 ${styles[type]}`}>{text}</span>;
}

export default function VersionComparison() {
  const { datasetId } = useParams();
  const [versions, setVersions] = useState([]);
  const [versionA, setVersionA] = useState('');
  const [versionB, setVersionB] = useState('');
  const [diff, setDiff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    versionApi
      .listForDataset(datasetId)
      .then((res) => {
        const vs = res.data.data;
        setVersions(vs);
        if (vs.length >= 2) {
          setVersionA(String(vs[1].id));
          setVersionB(String(vs[0].id));
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load versions'))
      .finally(() => setLoading(false));
  }, [datasetId]);

  async function runComparison() {
    setError('');
    setDiff(null);
    if (!versionA || !versionB) return;
    if (versionA === versionB) {
      setError('Please select two different versions to compare.');
      return;
    }
    setComparing(true);
    try {
      const res = await versionApi.compare(versionA, versionB);
      setDiff(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Comparison failed');
    } finally {
      setComparing(false);
    }
  }

  useEffect(() => {
    if (versionA && versionB) runComparison();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versionA, versionB]);

  if (loading) return <Loader label="Loading versions…" />;
  if (versions.length < 2) {
    return <EmptyState title="Not enough versions" description="You need at least two versions to run a comparison." />;
  }

  return (
    <div className="space-y-5">
      <div className="card p-5 flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="label">Version A (base)</label>
          <select className="input" value={versionA} onChange={(e) => setVersionA(e.target.value)}>
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.version_number} — {v.version_label}
              </option>
            ))}
          </select>
        </div>
        <div className="text-slate-400 font-bold pb-2 hidden sm:block">vs</div>
        <div className="flex-1 w-full">
          <label className="label">Version B (compare to)</label>
          <select className="input" value={versionB} onChange={(e) => setVersionB(e.target.value)}>
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.version_number} — {v.version_label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}
      {comparing && <Loader label="Comparing versions…" />}

      {diff && !comparing && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">Version A</p>
              <p className="text-sm font-semibold text-slate-800 mt-1">
                v{diff.versionA.versionNumber} — {diff.versionA.versionLabel}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{diff.versionA.recordCount} records · {diff.versionA.status}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">Version B</p>
              <p className="text-sm font-semibold text-slate-800 mt-1">
                v{diff.versionB.versionNumber} — {diff.versionB.versionLabel}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{diff.versionB.recordCount} records · {diff.versionB.status}</p>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Schema Differences</h3>
            {!diff.schemaDifferences.hasChanges ? (
              <p className="text-sm text-slate-400">No schema changes between these versions.</p>
            ) : (
              <div>
                {diff.schemaDifferences.columnsAdded.map((c) => (
                  <DiffPill key={`add-${c.name}`} type="added" text={`+ ${c.name} (${c.type})`} />
                ))}
                {diff.schemaDifferences.columnsRemoved.map((c) => (
                  <DiffPill key={`rem-${c.name}`} type="removed" text={`− ${c.name} (${c.type})`} />
                ))}
                {diff.schemaDifferences.columnTypeChanges.map((c) => (
                  <DiffPill key={`chg-${c.name}`} type="changed" text={`${c.name}: ${c.oldType} → ${c.newType}`} />
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Record Count Difference</h3>
              <p className="text-2xl font-bold text-slate-900">
                {diff.recordCountDifference.delta >= 0 ? '+' : ''}
                {diff.recordCountDifference.delta}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {diff.recordCountDifference.before} → {diff.recordCountDifference.after}
                {diff.recordCountDifference.percentChange !== null && ` (${diff.recordCountDifference.percentChange}%)`}
              </p>
            </div>
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Status Change</h3>
              <p className="text-sm text-slate-700">
                {diff.statusChange.changed ? (
                  <>
                    <span className="font-medium">{diff.statusChange.before}</span> →{' '}
                    <span className="font-medium">{diff.statusChange.after}</span>
                  </>
                ) : (
                  'No status change'
                )}
              </p>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Transformation Differences</h3>
            {diff.transformationDifferences.added.length === 0 && diff.transformationDifferences.removed.length === 0 ? (
              <p className="text-sm text-slate-400">No transformation differences.</p>
            ) : (
              <div>
                {diff.transformationDifferences.added.map((t) => (
                  <DiffPill key={`t-add-${t}`} type="added" text={`+ ${t}`} />
                ))}
                {diff.transformationDifferences.removed.map((t) => (
                  <DiffPill key={`t-rem-${t}`} type="removed" text={`− ${t}`} />
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Validation / Rule Differences</h3>
            {diff.validationDifferences.added.length === 0 && diff.validationDifferences.removed.length === 0 ? (
              <p className="text-sm text-slate-400">No validation rule differences.</p>
            ) : (
              <div>
                {diff.validationDifferences.added.map((t) => (
                  <DiffPill key={`v-add-${t}`} type="added" text={`+ ${t}`} />
                ))}
                {diff.validationDifferences.removed.map((t) => (
                  <DiffPill key={`v-rem-${t}`} type="removed" text={`− ${t}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
