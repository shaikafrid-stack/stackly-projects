import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Table from '../../components/Table.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Pagination from '../../components/Pagination.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import FormInput from '../../components/FormInput.jsx';

export default function DatasetOverview() {
  const [datasets, setDatasets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/datasets', {
        params: { page, limit: 8, status: statusFilter || undefined },
      });
      setDatasets(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load datasets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleArchiveRestore = async () => {
    if (!confirmTarget) return;
    setBusy(true);
    try {
      if (confirmTarget.status === 'Archived') {
        await api.post(`/datasets/${confirmTarget.id}/restore`);
        toast.success('Dataset restored.');
      } else {
        await api.delete(`/datasets/${confirmTarget.id}`);
        toast.success('Dataset archived.');
      }
      setConfirmTarget(null);
      loadData(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Dataset Overview</h1>
        <FormInput
          as="select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-48"
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'Draft', label: 'Draft' },
            { value: 'Published', label: 'Published' },
            { value: 'Archived', label: 'Archived' },
          ]}
        />
      </div>

      <Table
        loading={loading}
        rows={datasets}
        columns={[
          { key: 'dataset_name', header: 'Dataset' },
          { key: 'workspace_name', header: 'Workspace' },
          { key: 'owner_name', header: 'Owner', render: (r) => r.owner_name || '—' },
          { key: 'version', header: 'Version' },
          { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          {
            key: 'actions',
            header: 'Actions',
            render: (r) => (
              <button className="text-brand-600 hover:underline text-sm" onClick={() => setConfirmTarget(r)}>
                {r.status === 'Archived' ? 'Restore' : 'Archive'}
              </button>
            ),
          },
        ]}
      />

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={loadData} />

      <ConfirmDialog
        open={!!confirmTarget}
        title={confirmTarget?.status === 'Archived' ? 'Restore dataset?' : 'Archive dataset?'}
        message={`Are you sure you want to ${
          confirmTarget?.status === 'Archived' ? 'restore' : 'archive'
        } "${confirmTarget?.dataset_name}"?`}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={handleArchiveRestore}
        loading={busy}
      />
    </div>
  );
}
