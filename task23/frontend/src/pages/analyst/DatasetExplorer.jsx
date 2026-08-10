import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Table from '../../components/Table.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Pagination from '../../components/Pagination.jsx';

export default function DatasetExplorer() {
  const [datasets, setDatasets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/datasets', { params: { page, limit: 8 } });
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
  }, []);

  const toggleFavorite = async (id) => {
    try {
      const { data } = await api.post(`/datasets/${id}/favorite`);
      toast.success(data.favorited ? 'Added to favorites.' : 'Removed from favorites.');
    } catch {
      toast.error('Failed to update favorite.');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Dataset Explorer</h1>

      <Table
        loading={loading}
        rows={datasets}
        columns={[
          { key: 'dataset_name', header: 'Dataset', render: (r) => (
              <Link to={`/analyst/datasets/${r.id}`} className="text-brand-600 hover:underline font-medium">
                {r.dataset_name}
              </Link>
            ) },
          { key: 'workspace_name', header: 'Workspace' },
          { key: 'category', header: 'Category', render: (r) => r.category || '—' },
          { key: 'owner_name', header: 'Owner', render: (r) => r.owner_name || '—' },
          { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          {
            key: 'actions',
            header: 'Actions',
            render: (r) => (
              <button className="text-brand-600 hover:underline text-sm" onClick={() => toggleFavorite(r.id)}>
                ★ Favorite
              </button>
            ),
          },
        ]}
      />

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={loadData} />
    </div>
  );
}
