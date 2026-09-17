import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Wand2, History, FileSpreadsheet, Database } from 'lucide-react';
import { DatasetAPI } from '../api/endpoints';
import StatusBadge from '../components/StatusBadge';
import { SearchFilterBar, Select, Pagination } from '../components/Widgets';
import { LoadingState, EmptyState, ErrorState } from '../components/Overlay';

const STATUS_OPTIONS = [
  { value: 'PROCESSED', label: 'Processed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' }
];

export default function DatasetList() {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = () => {
    setLoading(true);
    DatasetAPI.list({ search, status, page, limit: 8 })
      .then((res) => {
        setDatasets(res.data.data);
        setPagination(res.data.pagination);
        setError('');
      })
      .catch(() => setError('Failed to load datasets.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, page]);

  return (
    <div className="space-y-5">
      <div>
        <p className="page-title">Datasets</p>
        <p className="page-subtitle">Select a processed dataset to inspect, transform, and prepare a new version.</p>
      </div>

      <div className="card p-5">
        <SearchFilterBar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} placeholder="Search datasets by name or description...">
          <Select value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={STATUS_OPTIONS} placeholder="All statuses" />
        </SearchFilterBar>

        {loading ? (
          <LoadingState label="Loading datasets..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : datasets.length === 0 ? (
          <EmptyState icon={Database} title="No datasets found" subtitle="Try adjusting your search or filters." />
        ) : (
          <>
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-400 uppercase border-b border-slate-100">
                    <th className="px-5 py-3">Dataset</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Rows</th>
                    <th className="px-5 py-3">Columns</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Quality</th>
                    <th className="px-5 py-3">Last Updated</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {datasets.map((d) => (
                    <tr key={d.id} className="border-b border-slate-50 hover:bg-brand-50/40 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="bg-brand-100 text-brand-600 rounded-lg p-1.5">
                            <FileSpreadsheet size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700">{d.name}</p>
                            <p className="text-xs text-slate-400">{d.file_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{d.file_type}</td>
                      <td className="px-5 py-3.5 text-slate-500">{d.row_count}</td>
                      <td className="px-5 py-3.5 text-slate-500">{d.column_count}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={d.status} /></td>
                      <td className="px-5 py-3.5">
                        <span className={`font-semibold ${d.quality_score >= 85 ? 'text-emerald-600' : d.quality_score >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {Number(d.quality_score).toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs">{new Date(d.updated_at).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          <button title="View / Preview" onClick={() => navigate(`/datasets/${d.id}?tab=preview`)} className="btn-ghost !px-2.5 !py-1.5 border border-slate-200">
                            <Eye size={15} />
                          </button>
                          <button
                            title="Prepare Dataset"
                            disabled={d.status !== 'PROCESSED'}
                            onClick={() => navigate(`/datasets/${d.id}?tab=builder`)}
                            className="btn-primary !px-2.5 !py-1.5"
                          >
                            <Wand2 size={15} />
                          </button>
                          <button title="View History" onClick={() => navigate(`/datasets/${d.id}?tab=history`)} className="btn-ghost !px-2.5 !py-1.5 border border-slate-200">
                            <History size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={pagination.totalPages} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
