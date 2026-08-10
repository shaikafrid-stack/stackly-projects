import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import FormInput from '../../components/FormInput.jsx';

export default function WorkspaceManagement() {
  const [workspaces, setWorkspaces] = useState([]);
  const [stewards, setStewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ workspace_name: '', description: '', steward_id: '' });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [wsRes, stewardRes] = await Promise.all([
        api.get('/workspaces'),
        api.get('/users', { params: { role: 'Data Steward' } }),
      ]);
      setWorkspaces(wsRes.data);
      setStewards(stewardRes.data);
    } catch {
      toast.error('Failed to load workspaces.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ workspace_name: '', description: '', steward_id: '' });
    setModalOpen(true);
  };

  const openEdit = (ws) => {
    setEditing(ws);
    setForm({ workspace_name: ws.workspace_name, description: ws.description || '', steward_id: ws.steward_id || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.workspace_name.trim()) return toast.error('Workspace name is required.');
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/workspaces/${editing.id}`, form);
        toast.success('Workspace updated.');
      } else {
        await api.post('/workspaces', form);
        toast.success('Workspace created.');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Workspace Management</h1>
        <Button onClick={openCreate}>+ New Workspace</Button>
      </div>

      <Table
        loading={loading}
        rows={workspaces}
        columns={[
          { key: 'workspace_name', header: 'Name' },
          { key: 'description', header: 'Description' },
          { key: 'steward_name', header: 'Data Steward', render: (r) => r.steward_name || '—' },
          { key: 'dataset_count', header: 'Datasets' },
          {
            key: 'actions',
            header: 'Actions',
            render: (r) => (
              <button className="text-brand-600 hover:underline text-sm" onClick={() => openEdit(r)}>
                Edit
              </button>
            ),
          },
        ]}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Workspace' : 'New Workspace'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput
            label="Workspace Name"
            value={form.workspace_name}
            onChange={(e) => setForm({ ...form, workspace_name: e.target.value })}
          />
          <FormInput
            label="Description"
            as="textarea"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <FormInput
            label="Assign Data Steward"
            as="select"
            value={form.steward_id}
            onChange={(e) => setForm({ ...form, steward_id: e.target.value })}
            options={[
              { value: '', label: 'Unassigned' },
              ...stewards.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}
