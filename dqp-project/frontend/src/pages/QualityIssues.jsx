import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import { getQualityIssues, getDataset, getDatasets } from '../api/datasets';

const ISSUE_LABELS = {
  MISSING_VALUES: 'Missing Values',
  INVALID_TYPE: 'Invalid Type',
  DUPLICATE_VALUES: 'Duplicate Values',
  DUPLICATE_RECORDS: 'Duplicate Records',
  INCONSISTENT_FORMAT: 'Inconsistent Format',
};

export default function QualityIssues() {
  const { id } = useParams(); // optional: /datasets/:id/issues
  const [searchParams] = useSearchParams();
  const [dataset, setDataset] = useState(null);
  const [datasetOptions, setDatasetOptions] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(id || '');
  const [issues, setIssues] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [issueType, setIssueType] = useState('');
  const [severity, setSeverity] = useState('');
  const [column, setColumn] = useState('');

  useEffect(() => {
    if (!id) {
      getDatasets({ limit: 100, status: 'PROCESSED' }).then((res) => setDatasetOptions(res.data.data));
    }
  }, [id]);

  const load = useCallback(() => {
    if (!selectedDatasetId) {
      setLoading(false);
      setIssues([]);
      return;
    }
    setLoading(true);
    Promise.all([
      getDataset(selectedDatasetId),
      getQualityIssues(selectedDatasetId, { issueType, severity, column, page, limit: 10 }),
    ])
      .then(([dRes, iRes]) => {
        setDataset(dRes.data.data);
        setIssues(iRes.data.data);
        setPagination(iRes.data.pagination);
        setError('');
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load quality issues'))
      .finally(() => setLoading(false));
  }, [selectedDatasetId, issueType, severity, column, page]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: 'columnName', label: 'Column', render: (r) => r.columnName || <span className="text-slate-400">(dataset-level)</span> },
    { key: 'issueType', label: 'Issue Type', render: (r) => ISSUE_LABELS[r.issueType] || r.issueType },
    { key: 'affectedRecords', label: 'Affected Records' },
    { key: 'percentage', label: 'Percentage', render: (r) => `${r.percentage}%` },
    { key: 'severity', label: 'Severity', render: (r) => <Badge status={r.severity} /> },
    { key: 'description', label: 'Description', render: (r) => <span className="text-slate-500 text-xs">{r.description}</span> },
  ];

  return (
    <DashboardLayout title="Data Quality Issues">
      {id && (
        <div className="mb-4">
          <Link to={`/datasets/${id}`} className="text-sm text-brand-600 hover:underline">← Back to dataset</Link>
        </div>
      )}
      <Card>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4">
          {!id && (
            <select className="input max-w-xs" value={selectedDatasetId} onChange={(e) => { setPage(1); setSelectedDatasetId(e.target.value); }}>
              <option value="">Select a dataset...</option>
              {datasetOptions.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          )}
          <input className="input max-w-[160px]" placeholder="Filter by column..." value={column} onChange={(e) => { setPage(1); setColumn(e.target.value); }} />
          <select className="input max-w-[180px]" value={issueType} onChange={(e) => { setPage(1); setIssueType(e.target.value); }}>
            <option value="">All Issue Types</option>
            {Object.entries(ISSUE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="input max-w-[160px]" value={severity} onChange={(e) => { setPage(1); setSeverity(e.target.value); }}>
            <option value="">All Severities</option>
            <option value="HIGH">High</option>
            <option value="WARNING">Warning</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {!selectedDatasetId && <EmptyState title="Select a dataset" description="Choose a dataset above to view its data quality issues." />}
        {loading && selectedDatasetId && <Loader label="Loading issues..." />}
        {error && <p className="text-rose-600 text-sm">{error}</p>}
        {!loading && !error && selectedDatasetId && issues.length === 0 && (
          <EmptyState title="No quality issues found" description="This dataset has no recorded issues matching the current filters." />
        )}
        {!loading && issues.length > 0 && <Table columns={columns} rows={issues} />}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-end items-center gap-2 mt-4 text-sm">
            <button className="btn btn-secondary !px-3 !py-1" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <span className="text-slate-500">Page {pagination.page} of {pagination.totalPages}</span>
            <button className="btn btn-secondary !px-3 !py-1" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
