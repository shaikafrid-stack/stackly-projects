import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import FormInput from '../../components/FormInput.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Pagination from '../../components/Pagination.jsx';

export default function DatasetManagement() {
  const [datasets, setDatasets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    workspace_id: '', dataset_name: '', description: '', category: '', data_source: '', tags: '',
  });

  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/datasets', { params: { page, limit: 8, search: search || undefined } });
      setDatasets(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load datasets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/workspaces').then(({ data }) => setWorkspaces(data)).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadData(1), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreate = () => {
    setForm({ workspace_id: workspaces[0]?.id || '', dataset_name: '', description: '', category: '', data_source: '', tags: '' });
    setModalOpen(true);
  };

  const handleCreate = async () => {
    if (!form.workspace_id || !form.dataset_name.trim()) {
      return toast.error('Workspace and dataset name are required.');
    }
    setSaving(true);
    try {
      await api.post('/datasets', {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      toast.success('Dataset registered successfully.');
      setModalOpen(false);
      loadData(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register dataset.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async (ds) => {
    const nextStatus = ds.status === 'Published' ? 'Draft' : 'Published';
    try {
      await api.put(`/datasets/${ds.id}`, { status: nextStatus });
      toast.success(`Dataset marked as ${nextStatus}.`);
      loadData(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Dataset Management</h1>
        <Button onClick={openCreate}>+ Register Dataset</Button>
      </div>

      <FormInput
        placeholder="Search datasets by name or description..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <Table
        loading={loading}
        rows={datasets}
        columns={[
          { key: 'dataset_name', header: 'Dataset' },
          { key: 'category', header: 'Category', render: (r) => r.category || '—' },
          { key: 'version', header: 'Version' },
          { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          {
            key: 'actions',
            header: 'Actions',
            render: (r) => (
              <div className="flex gap-3 text-sm">
                <Link className="text-brand-600 hover:underline" to={`/steward/datasets/${r.id}/metadata`}>
                  Edit Metadata
                </Link>
                <Link className="text-brand-600 hover:underline" to={`/steward/datasets/${r.id}/versions`}>
                  Versions
                </Link>
                <button className="text-brand-600 hover:underline" onClick={() => handlePublishToggle(r)}>
                  {r.status === 'Published' ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            ),
          },
        ]}
      />

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={loadData} />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register New Dataset"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving}>Register</Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput
            label="Workspace"
            as="select"
            value={form.workspace_id}
            onChange={(e) => setForm({ ...form, workspace_id: e.target.value })}
            options={workspaces.map((w) => ({ value: w.id, label: w.workspace_name }))}
          />
          <FormInput
            label="Dataset Name"
            value={form.dataset_name}
            onChange={(e) => setForm({ ...form, dataset_name: e.target.value })}
          />
          <FormInput
            label="Description"
            as="textarea"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <FormInput
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <FormInput
            label="Data Source"
            value={form.data_source}
            onChange={(e) => setForm({ ...form, data_source: e.target.value })}
          />
          <FormInput
            label="Tags (comma-separated)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="sales, q1, transactions"
          />
        </div>
      </Modal>
    </div>
  );
}
