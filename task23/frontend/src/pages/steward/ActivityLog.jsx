import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Table from '../../components/Table.jsx';
import FormInput from '../../components/FormInput.jsx';

export default function ActivityLog() {
  const [datasets, setDatasets] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/datasets', { params: { limit: 100 } }).then(({ data }) => {
      setDatasets(data.data);
      if (data.data.length) setSelectedId(String(data.data[0].id));
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    api
      .get(`/datasets/${selectedId}/activity`)
      .then(({ data }) => setActivity(data))
      .catch(() => toast.error('Failed to load activity.'))
      .finally(() => setLoading(false));
  }, [selectedId]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Activity Log</h1>

      <FormInput
        label="Select Dataset"
        as="select"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="max-w-sm"
        options={datasets.map((d) => ({ value: d.id, label: d.dataset_name }))}
      />

      <Table
        loading={loading}
        rows={activity}
        columns={[
          { key: 'activity', header: 'Activity' },
          { key: 'version', header: 'Version', render: (r) => r.version || '—' },
          { key: 'user_name', header: 'By', render: (r) => r.user_name || 'System' },
          { key: 'activity_time', header: 'Timestamp', render: (r) => new Date(r.activity_time).toLocaleString() },
        ]}
        emptyMessage="No activity recorded for this dataset."
      />
    </div>
  );
}
