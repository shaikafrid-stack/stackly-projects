import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Table from '../../components/Table.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Button from '../../components/Button.jsx';

export default function DatasetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState(null);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    Promise.all([api.get(`/datasets/${id}`), api.get(`/datasets/${id}/activity`)])
      .then(([dsRes, actRes]) => {
        setDataset(dsRes.data);
        setActivity(actRes.data);
      })
      .catch(() => toast.error('Failed to load dataset details.'));
  }, [id]);

  if (!dataset) return <p className="text-slate-400">Loading...</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">{dataset.dataset_name}</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <div className="card grid grid-cols-2 gap-4 text-sm">
        <div><p className="label">Workspace</p><p>{dataset.workspace_name}</p></div>
        <div><p className="label">Category</p><p>{dataset.category || '—'}</p></div>
        <div><p className="label">Owner</p><p>{dataset.owner_name || '—'}</p></div>
        <div><p className="label">Data Source</p><p>{dataset.data_source || '—'}</p></div>
        <div><p className="label">Version</p><p>{dataset.version}</p></div>
        <div><p className="label">Status</p><StatusBadge status={dataset.status} /></div>
        <div><p className="label">Created</p><p>{new Date(dataset.created_at).toLocaleDateString()}</p></div>
        <div><p className="label">Last Updated</p><p>{new Date(dataset.updated_at).toLocaleDateString()}</p></div>
        <div className="col-span-2"><p className="label">Description</p><p>{dataset.description || '—'}</p></div>
        <div className="col-span-2">
          <p className="label">Tags</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {dataset.tags.length ? dataset.tags.map((t) => (
              <span key={t.id} className="badge bg-brand-50 text-brand-700">{t.tag_name}</span>
            )) : <p className="text-slate-400">No tags</p>}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Version History</h3>
        <Table
          rows={activity}
          columns={[
            { key: 'version', header: 'Version', render: (r) => r.version || '—' },
            { key: 'activity', header: 'Change' },
            { key: 'activity_time', header: 'Date', render: (r) => new Date(r.activity_time).toLocaleDateString() },
          ]}
          emptyMessage="No version history available."
        />
      </div>
    </div>
  );
}
