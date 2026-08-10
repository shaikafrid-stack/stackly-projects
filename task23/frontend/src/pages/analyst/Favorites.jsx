import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Table from '../../components/Table.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get('/datasets/favorites/mine')
      .then(({ data }) => setFavorites(data))
      .catch(() => toast.error('Failed to load favorites.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const removeFavorite = async (id) => {
    try {
      await api.post(`/datasets/${id}/favorite`);
      load();
    } catch {
      toast.error('Failed to update favorite.');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">My Favorites</h1>

      <Table
        loading={loading}
        rows={favorites}
        emptyMessage="You haven't favorited any datasets yet."
        columns={[
          { key: 'dataset_name', header: 'Dataset', render: (r) => (
              <Link to={`/analyst/datasets/${r.id}`} className="text-brand-600 hover:underline font-medium">
                {r.dataset_name}
              </Link>
            ) },
          { key: 'workspace_name', header: 'Workspace' },
          { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          {
            key: 'actions',
            header: 'Actions',
            render: (r) => (
              <button className="text-red-500 hover:underline text-sm" onClick={() => removeFavorite(r.id)}>
                Remove
              </button>
            ),
          },
        ]}
      />
    </div>
  );
}
