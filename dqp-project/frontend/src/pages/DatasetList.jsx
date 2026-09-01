import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { getDatasets, uploadDataset, runProfiling } from '../api/datasets';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DatasetList() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [datasetName, setDatasetName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [profilingId, setProfilingId] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const load = useCallback(() => {
    setLoading(true);
    getDatasets({ search, status, page, limit: 8 })
      .then((res) => {
        setDatasets(res.data.data);
        setPagination(res.data.pagination);
        setError('');
      })
      .catch(() => setError('Failed to load datasets'))
      .finally(() => setLoading(false));
  }, [search, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (datasetName) formData.append('name', datasetName);
      await uploadDataset(formData);
      setUploadOpen(false);
      setFile(null);
      setDatasetName('');
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleProfile = async (id) => {
    setProfilingId(id);
    try {
      await runProfiling(id);
      load();
      navigate(`/datasets/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Profiling failed');
    } finally {
      setProfilingId(null);
    }
  };

  const columns = [
    { key: 'name', label: 'Dataset Name', sortable: false, render: (r) => (
      <button className="font-medium text-brand-600 hover:underline" onClick={() => navigate(`/datasets/${r.id}`)}>{r.name}</button>
    ) },
    { key: 'fileType', label: 'File Type' },
    { key: 'rowCount', label: 'Rows', render: (r) => r.rowCount?.toLocaleString() },
    { key: 'columnCount', label: 'Columns' },
    { key: 'status', label: 'Processing Status', render: (r) => <Badge status={r.status} /> },
    { key: 'lastProfiledAt', label: 'Last Profiled', render: (r) => (r.lastProfiledAt ? new Date(r.lastProfiledAt).toLocaleDateString() : '—') },
    { key: 'qualityScore', label: 'Quality Score', render: (r) => (r.qualityScore != null ? `${r.qualityScore}%` : '—') },
    { key: 'actions', label: 'Actions', render: (r) => (
      <div className="flex gap-2">
        <button className="btn btn-secondary !px-2 !py-1 text-xs" onClick={() => navigate(`/datasets/${r.id}`)}>View</button>
        {r.status === 'PROCESSED' && (
          <button
            className="btn btn-primary !px-2 !py-1 text-xs"
            disabled={profilingId === r.id}
            onClick={() => handleProfile(r.id)}
          >
            {profilingId === r.id ? 'Profiling...' : r.profileStatus === 'COMPLETED' ? 'Re-Profile' : 'Profile'}
          </button>
        )}
        {r.profileStatus === 'COMPLETED' && (
          <button className="btn btn-secondary !px-2 !py-1 text-xs" onClick={() => navigate(`/datasets/${r.id}/columns`)}>Results</button>
        )}
      </div>
    ) },
  ];

  const canUpload = ['ADMINISTRATOR', 'DATA_ANALYST', 'DATA_STEWARD'].includes(user?.role);

  return (
    <DashboardLayout title="Datasets">
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex flex-1 gap-2">
            <input
              className="input max-w-xs"
              placeholder="Search datasets..."
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            />
            <select className="input max-w-[180px]" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
              <option value="">All Statuses</option>
              <option value="PROCESSED">Processed</option>
              <option value="PROCESSING">Processing</option>
              <option value="UPLOADED">Uploaded</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          {canUpload && (
            <button className="btn btn-primary" onClick={() => setUploadOpen(true)}>+ Upload Dataset</button>
          )}
        </div>

        {loading && <Loader label="Loading datasets..." />}
        {error && <p className="text-rose-600 text-sm">{error}</p>}
        {!loading && !error && datasets.length === 0 && (
          <EmptyState title="No datasets found" description="Upload a CSV file to get started with profiling." />
        )}
        {!loading && datasets.length > 0 && <Table columns={columns} rows={datasets} />}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-end items-center gap-2 mt-4 text-sm">
            <button className="btn btn-secondary !px-3 !py-1" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <span className="text-slate-500">Page {pagination.page} of {pagination.totalPages}</span>
            <button className="btn btn-secondary !px-3 !py-1" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        )}
      </Card>

      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload Dataset"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setUploadOpen(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={!file || uploading} onClick={handleUpload}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </>
        }
      >
        <form className="space-y-3" onSubmit={handleUpload}>
          <div>
            <label className="text-sm font-medium text-slate-600">Dataset Name (optional)</label>
            <input className="input mt-1" value={datasetName} onChange={(e) => setDatasetName(e.target.value)} placeholder="e.g. Customer Master Data" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">CSV File</label>
            <input type="file" accept=".csv" className="input mt-1" onChange={(e) => setFile(e.target.files[0])} />
            <p className="text-xs text-slate-400 mt-1">Only CSV files are currently supported for profiling.</p>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
