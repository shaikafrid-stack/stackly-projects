import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';

export default function VersionHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get(`/datasets/${id}`), api.get(`/datasets/${id}/activity`)])
      .then(([dsRes, actRes]) => {
        setDataset(dsRes.data);
        setActivity(actRes.data);
      })
      .catch(() => toast.error('Failed to load version history.'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">
          Version History {dataset ? `— ${dataset.dataset_name}` : ''}
        </h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </div>

      {dataset && <p className="text-sm text-slate-500">Current version: <span className="font-semibold">{dataset.version}</span></p>}

      <Table
        loading={loading}
        rows={activity}
        columns={[
          { key: 'version', header: 'Version', render: (r) => r.version || '—' },
          { key: 'activity', header: 'Change' },
          { key: 'user_name', header: 'Updated By', render: (r) => r.user_name || 'System' },
          { key: 'activity_time', header: 'Date', render: (r) => new Date(r.activity_time).toLocaleString() },
        ]}
        emptyMessage="No version history recorded yet."
      />
    </div>
  );
}
