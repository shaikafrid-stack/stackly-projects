import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Power, UserCog } from 'lucide-react';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import SearchBar from '../../components/SearchBar.jsx';
import Pagination from '../../components/Pagination.jsx';
import Modal from '../../components/Modal.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import api from '../../api/axios.js';

const emptyForm = { workspace_name: '', description: '', status: 'Active' };

export default function WorkspaceManagement() {
  const [workspaces, setWorkspaces] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [assignModal, setAssignModal] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  const limit = 8;

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/workspaces', {
        params: { search, status: statusFilter, page, limit },
      });
      setWorkspaces(data.data);
      setTotal(data.total);
    } catch (err) {
      toast.error('Failed to load workspaces.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, page]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (ws) => {
    setEditing(ws);
    setForm({ workspace_name: ws.workspace_name, description: ws.description || '', status: ws.status });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/workspaces/${editing.id}`, form);
        toast.success('Workspace updated successfully.');
      } else {
        await api.post('/workspaces', form);
        toast.success('Workspace created successfully.');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save workspace.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/workspaces/${confirmDelete.id}`);
      toast.success('Workspace deleted successfully.');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete workspace.');
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (ws) => {
    try {
      const next = ws.status === 'Active' ? 'Inactive' : 'Active';
      await api.patch(`/workspaces/${ws.id}/status`, { status: next });
      toast.success(`Workspace ${next === 'Active' ? 'activated' : 'deactivated'}.`);
      load();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const openAssign = async (ws) => {
    setAssignModal(ws);
    setSelectedUserId('');
    try {
      const { data } = await api.get('/dashboard/users');
      setUsers(data.filter((u) => u.role !== 'Administrator'));
    } catch (err) {
      toast.error('Failed to load users.');
    }
  };

  const handleAssignManager = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    try {
      await api.post(`/workspaces/${assignModal.id}/assign-manager`, { user_id: selectedUserId });
      toast.success('Workspace Manager assigned successfully.');
      setAssignModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign manager.');
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold">Workspace Management</h2>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> New Workspace
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="w-64">
          <SearchBar value={search} onChange={setSearch} placeholder="Search workspaces..." />
        </div>
        <select
          className="input w-48"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Created By</th>
                <th className="pb-3 pr-4">Members</th>
                <th className="pb-3 pr-4">Dashboards</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workspaces.map((ws) => (
                <tr key={ws.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 pr-4">
                    <p className="font-medium">{ws.workspace_name}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{ws.description}</p>
                  </td>
                  <td className="py-3 pr-4">{ws.created_by_name}</td>
                  <td className="py-3 pr-4">{ws.member_count}</td>
                  <td className="py-3 pr-4">{ws.dashboard_count}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={ws.status} />
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-1.5">
                      <button title="Assign Manager" className="btn-secondary !px-2" onClick={() => openAssign(ws)}>
                        <UserCog size={15} />
                      </button>
                      <button title="Toggle Status" className="btn-secondary !px-2" onClick={() => toggleStatus(ws)}>
                        <Power size={15} />
                      </button>
                      <button title="Edit" className="btn-secondary !px-2" onClick={() => openEdit(ws)}>
                        <Pencil size={15} />
                      </button>
                      <button
                        title="Delete"
                        className="btn-danger !px-2"
                        onClick={() => setConfirmDelete(ws)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {workspaces.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No workspaces found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Workspace' : 'Create Workspace'}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" form="workspace-form" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <form id="workspace-form" onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Workspace Name</label>
            <input
              className="input"
              required
              value={form.workspace_name}
              onChange={(e) => setForm({ ...form, workspace_name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!assignModal}
        onClose={() => setAssignModal(null)}
        title={`Assign Workspace Manager - ${assignModal?.workspace_name || ''}`}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setAssignModal(null)}>
              Cancel
            </button>
            <button className="btn-primary" form="assign-form">
              Assign
            </button>
          </>
        }
      >
        <form id="assign-form" onSubmit={handleAssignManager} className="space-y-4">
          <div>
            <label className="label">Select User</label>
            <select
              className="input"
              required
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">-- Select a user --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email}) - {u.role}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Workspace"
        message={`Are you sure you want to delete "${confirmDelete?.workspace_name}"? This will remove all its members and dashboards. This action cannot be undone.`}
      />
    </Layout>
  );
}
