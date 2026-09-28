import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lineageApi } from '../api/api';
import { Loader, ErrorBanner } from '../components/Loader';
import StatusBadge from '../components/StatusBadge';

export default function DatasetLineage() {
  const { datasetId } = useParams();
  const [lineage, setLineage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    lineageApi
      .forDataset(datasetId)
      .then((res) => setLineage(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load lineage'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [datasetId]);

  if (loading) return <Loader label="Loading lineage…" />;
  if (error) return <ErrorBanner message={error} onRetry={load} />;
  if (!lineage) return null;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-6">Dataset Lineage Chain</h3>

        <div className="flex flex-col">
          {lineage.nodes.map((node, idx) => {
            const edge = lineage.edges.find((e) => e.target === node.id);
            return (
              <div key={node.id} className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      node.status === 'Active' ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'
                    }`}
                  />
                  {idx < lineage.nodes.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 min-h-[3.5rem]" />}
                </div>

                <div className="pb-8 flex-1">
                  {edge && (
                    <div className="mb-2 text-xs text-slate-400">
                      ↳ derived via: <span className="font-medium text-slate-600">{edge.transformation}</span>
                      {'  '}by <span className="font-medium text-slate-600">{edge.user}</span>
                      {'  '}on {new Date(edge.timestamp).toLocaleString()}
                    </div>
                  )}
                  <Link
                    to={`/versions/${node.id}`}
                    className="card p-4 flex items-center justify-between hover:shadow-cardHover transition-shadow"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        v{node.version_number} — {node.version_label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{node.change_summary}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {node.created_by} · {new Date(node.created_at).toLocaleString()}
                      </p>
                    </div>
                    <StatusBadge status={node.status} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-4 flex items-start gap-3 bg-brand-50/60 border-brand-100">
        <span className="text-brand-600">ℹ️</span>
        <p className="text-xs text-slate-600 leading-relaxed">
          The lineage chain is derived from <code className="font-mono">parent_version_id</code> references on{' '}
          <code className="font-mono">DatasetVersion</code>. A restore operation creates a new version whose parent
          is the previous latest version — so the full history, including which version a restore came from, is
          always preserved rather than overwritten.
        </p>
      </div>
    </div>
  );
}
