import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Archive, Trash2 } from 'lucide-react';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import SearchBar from '../../components/SearchBar.jsx';
import Pagination from '../../components/Pagination.jsx';
import Modal from '../../components/Modal.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import api from '../../api/axios.js';

const emptyForm = { dashboard_name: '', category: 'General', description: '', status: 'Active' };

export default function DashboardManagement() {
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceId, setWorkspaceId] = useState('');
  const [dashboards, setDashboards] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const limit = 8;

  const loadWorkspaces = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/workspaces', { params: { limit: 100 } });
      setWorkspaces(data.data);
      if (data.data.length > 0) setWorkspaceId(String(data.data[0].id));
    } catch (err) {
      toast.error('Failed to load workspaces.');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboards = async () => {
    if (!workspaceId) return;
    setListLoading(true);
    try {
      const { data } = await api.get('/dashboards', {
        params: { workspace_id: workspaceId, search, category, page, limit },
      });
      setDashboards(data.data);
      setTotal(data.total);
    } catch (err) {
      toast.error('Failed to load dashboards.');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    loadDashboards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, search, category, page]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (d) => {
    setEditing(d);
    setForm({ dashboard_name: d.dashboard_name, category: d.category, description: d.description || '', status: d.status });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/dashboards/${editing.id}`, form);
        toast.success('Dashboard updated successfully.');
      } else {
        await api.post('/dashboards', { ...form, workspace_id: workspaceId });
        toast.success('Dashboard created successfully.');
      }
      setModalOpen(false);
      loadDashboards();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save dashboard.');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (d) => {
    try {
      await api.patch(`/dashboards/${d.id}/archive`);
      toast.success('Dashboard status updated.');
      loadDashboards();
    } catch (err) {
      toast.error('Failed to update dashboard status.');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/dashboards/${confirmDelete.id}`);
      toast.success('Dashboard deleted successfully.');
      setConfirmDelete(null);
      loadDashboards();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete dashboard.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Layout><Loader /></Layout>;

  return (
    <Layout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="text-xl font-bold">Dashboard Management</h2>
        <button className="btn-primary" onClick={openCreate} disabled={!workspaceId}>
          <Plus size={16} /> New Dashboard
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select className="input w-64" value={workspaceId} onChange={(e) => { setWorkspaceId(e.target.value); setPage(1); }}>
          {workspaces.map((w) => (
            <option key={w.id} value={w.id}>
              {w.workspace_name}
            </option>
          ))}
        </select>
        <div className="w-64">
          <SearchBar value={search} onChange={setSearch} placeholder="Search dashboards..." />
        </div>
        <input
          className="input w-48"
          placeholder="Filter by category"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
        />
      </div>

      {listLoading ? (
        <Loader />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Created By</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dashboards.map((d) => (
                <tr key={d.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 pr-4">
                    <p className="font-medium">{d.dashboard_name}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{d.description}</p>
                  </td>
                  <td className="py-3 pr-4">{d.category}</td>
                  <td className="py-3 pr-4">{d.created_by_name}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-1.5">
                      <button title="Edit" className="btn-secondary !px-2" onClick={() => openEdit(d)}>
                        <Pencil size={15} />
                      </button>
                      <button title="Archive/Unarchive" className="btn-secondary !px-2" onClick={() => handleArchive(d)}>
                        <Archive size={15} />
                      </button>
                      <button title="Delete" className="btn-danger !px-2" onClick={() => setConfirmDelete(d)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {dashboards.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No dashboards found.
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
        title={editing ? 'Edit Dashboard' : 'Create Dashboard'}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" form="dashboard-form" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <form id="dashboard-form" onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Dashboard Name</label>
            <input
              className="input"
              required
              value={form.dashboard_name}
              onChange={(e) => setForm({ ...form, dashboard_name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Category</label>
            <input
              className="input"
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
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
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Dashboard"
        message={`Are you sure you want to delete "${confirmDelete?.dashboard_name}"? This action cannot be undone.`}
      />
    </Layout>
  );
}
