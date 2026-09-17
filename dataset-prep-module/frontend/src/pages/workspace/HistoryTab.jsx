import React, { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { HistoryAPI } from '../../api/endpoints';
import { SearchFilterBar, Select, Pagination } from '../../components/Widgets';
import { LoadingState, EmptyState } from '../../components/Overlay';
import StatusBadge from '../../components/StatusBadge';
import { ALL_OPS } from '../../utils/transformCatalog';

const TYPE_OPTIONS = ALL_OPS.map((o) => ({ value: o.type, label: o.label }));
const STATUS_OPTIONS = [
  { value: 'SUCCESS', label: 'Success' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'SKIPPED', label: 'Skipped' }
];

export default function HistoryTab({ datasetId, refreshKey }) {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    HistoryAPI.forDataset(datasetId, { search, type, status, page, limit: 8 })
      .then((res) => { setRows(res.data.data); setPagination(res.data.pagination); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId, search, type, status, page, refreshKey]);

  return (
    <div className="space-y-4">
      <div>
        <p className="font-bold text-slate-700">Transformation History</p>
        <p className="text-xs text-slate-400">Full audit trail of every transformation step executed for this dataset.</p>
      </div>

      <div className="card p-5">
        <SearchFilterBar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} placeholder="Search by version name...">
          <Select value={type} onChange={(v) => { setType(v); setPage(1); }} options={TYPE_OPTIONS} placeholder="All types" />
          <Select value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={STATUS_OPTIONS} placeholder="All statuses" />
        </SearchFilterBar>

        {loading ? (
          <LoadingState label="Loading history..." />
        ) : rows.length === 0 ? (
          <EmptyState icon={History} title="No history yet" subtitle="Once you save a prepared version, its transformation steps will appear here." />
        ) : (
          <>
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-400 uppercase border-b border-slate-100">
                    <th className="px-5 py-3">Version</th>
                    <th className="px-5 py-3">Transformation</th>
                    <th className="px-5 py-3">Column</th>
                    <th className="px-5 py-3">Records Affected</th>
                    <th className="px-5 py-3">Performed By</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((h) => (
                    <tr key={h.id} className="border-b border-slate-50 hover:bg-brand-50/40">
                      <td className="px-5 py-3 text-slate-600">{h.version_name ? `v${h.version_number} — ${h.version_name}` : '—'}</td>
                      <td className="px-5 py-3 font-medium text-slate-700">{h.transformation_type?.replace(/_/g, ' ') || '—'}</td>
                      <td className="px-5 py-3 text-slate-500">{h.column_name || '—'}</td>
                      <td className="px-5 py-3 text-slate-500">{h.records_affected}</td>
                      <td className="px-5 py-3 text-slate-500">{h.performed_by_name || '—'}</td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{new Date(h.executed_at).toLocaleString()}</td>
                      <td className="px-5 py-3"><StatusBadge status={h.status} /></td>
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
