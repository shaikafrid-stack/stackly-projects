import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import SearchFilter from '../components/SearchFilter';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Modal from '../components/Modal';
import { listDatasets, deleteDataset } from '../api/datasets';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const STATUS_OPTIONS = ['UPLOADED', 'VALIDATING', 'VALIDATION_FAILED', 'VALIDATED', 'PROCESSING', 'PROCESSED', 'FAILED'];

export default function DatasetList() {
  const [data, setData] = useState({ datasets: [], total: 0, page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchData = useCallback(() => {
    setLoading(true);
    setError('');
    listDatasets({ search, status, page, limit: 10 })
      .then(setData)
      .catch(() => setError('Failed to load datasets'))
      .finally(() => setLoading(false));
  }, [search, status, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    try {
      await deleteDataset(deleteTarget.id);
      showToast('Dataset deleted', 'success');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete dataset', 'error');
    }
  };

  const totalPages = Math.max(Math.ceil(data.total / data.limit), 1);

  const columns = [
    { key: 'name', label: 'Dataset Name', render: (r) => <Link to={`/datasets/${r.id}`} className="text-brand-600 hover:underline font-medium">{r.name}</Link> },
    { key: 'file_type', label: 'File Type' },
    { key: 'uploader', label: 'Uploaded By', render: (r) => r.uploader?.name || '-' },
    { key: 'uploaded_at', label: 'Upload Date', render: (r) => new Date(r.uploaded_at).toLocaleString() },
    { key: 'row_count', label: 'Records' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex gap-3 text-sm">
          <button onClick={() => navigate(`/datasets/${r.id}`)} className="text-brand-600 hover:underline">View</button>
          {user?.role === 'ADMIN' && (
            <button onClick={() => setDeleteTarget(r)} className="text-red-600 hover:underline">Delete</button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Datasets</h1>
          {user?.role === 'ANALYST' && (
            <Link to="/datasets/upload" className="bg-brand-600 text-white text-sm px-4 py-2 rounded-md hover:bg-brand-700">
              Upload Dataset
            </Link>
          )}
        </div>

        <SearchFilter
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          status={status}
          onStatusChange={(v) => { setStatus(v); setPage(1); }}
          statusOptions={STATUS_OPTIONS}
        />

        {loading && <LoadingState label="Loading datasets..." />}
        {error && <ErrorState message={error} />}
        {!loading && !error && data.datasets.length === 0 && (
          <EmptyState title="No datasets found" subtitle="Upload a dataset to get started." />
        )}
        {!loading && !error && data.datasets.length > 0 && (
          <>
            <Table columns={columns} rows={data.datasets} />
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>

      <Modal
        open={!!deleteTarget}
        title="Delete dataset"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        confirmLabel="Delete"
        danger
      >
        Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
      </Modal>
    </div>
  );
}
