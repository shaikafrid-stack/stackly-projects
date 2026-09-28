import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { changeHistoryApi } from '../api/api';
import { Loader, ErrorBanner, EmptyState } from '../components/Loader';

const TYPE_COLORS = {
  COLUMN_ADDED: 'bg-emerald-100 text-emerald-700',
  COLUMN_REMOVED: 'bg-rose-100 text-rose-700',
  COLUMN_TYPE_CHANGED: 'bg-amber-100 text-amber-700',
  COLUMN_RENAMED: 'bg-amber-100 text-amber-700',
  RECORDS_ADDED: 'bg-emerald-100 text-emerald-700',
  RECORDS_REMOVED: 'bg-rose-100 text-rose-700',
  TRANSFORMATION_APPLIED: 'bg-brand-100 text-brand-700',
  VALIDATION_CHANGED: 'bg-violet-100 text-violet-700',
  STATUS_CHANGED: 'bg-slate-200 text-slate-700',
  VERSION_RESTORED: 'bg-amber-100 text-amber-700',
};

export default function ChangeHistory() {
  const { datasetId } = useParams();
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    changeHistoryApi
      .forDataset(datasetId)
      .then((res) => setEntries(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load change history'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [datasetId]);

  if (loading) return <Loader label="Loading change history…" />;
  if (error) return <ErrorBanner message={error} onRetry={load} />;

  const types = ['ALL', ...new Set(entries.map((e) => e.change_type))];
  const filtered = filter === 'ALL' ? entries : entries.filter((e) => e.change_type === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
              filter === t ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
            }`}
          >
            {t.replaceAll('_', ' ')}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No changes recorded" description="Once versions are created, granular changes will appear here." />
      ) : (
        <div className="card divide-y divide-slate-100">
          {filtered.map((e) => (
            <div key={e.id} className="p-4 flex items-start gap-3">
              <span className={`shrink-0 rounded px-2 py-1 text-[10px] font-bold uppercase ${TYPE_COLORS[e.change_type] || 'bg-slate-100 text-slate-600'}`}>
                {e.change_type.replaceAll('_', ' ')}
              </span>
              <div className="flex-1">
                <p className="text-sm text-slate-700">{e.description}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  v{e.version_number} ({e.version_label}) · {e.changed_by} · {new Date(e.changed_at).toLocaleString()}
                </p>
                {(e.old_value || e.new_value) && (
                  <p className="text-xs text-slate-500 mt-1">
                    {e.old_value && <span className="line-through text-rose-500 mr-2">{e.old_value}</span>}
                    {e.new_value && <span className="text-emerald-600 font-medium">{e.new_value}</span>}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
