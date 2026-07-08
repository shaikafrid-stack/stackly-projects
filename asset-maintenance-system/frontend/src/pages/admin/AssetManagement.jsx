import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { assetService } from '../../services/assetService';
import { userService } from '../../services/userService';
import { StatusBadge } from '../../components/Badges';
import SearchFilterBar from '../../components/SearchFilterBar';
import Pagination from '../../components/Pagination';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';

const STATUS_OPTIONS = ['active', 'in_maintenance', 'retired'];

const EMPTY_FORM = {
  asset_name: '',
  asset_code: '',
  category: '',
  purchase_date: '',
  warranty_expiry: '',
  status: 'active',
  assigned_to: '',
};

export default function AssetManagement() {
  const [assets, setAssets] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const [employees, setEmployees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchAssets = () => {
    setLoading(true);
    assetService
      .getAll({ search, status, page, limit: 8 })
      .then((res) => {
        setAssets(res.data.data);
        setMeta(res.data.meta);
      })
      .catch(() => toast.error('Failed to load assets.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, page]);

  useEffect(() => {
    userService
      .getAll({ role: 'employee' })
      .then((res) => setEmployees(res.data.data))
      .catch(() => {});
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (asset) => {
    setEditingId(asset.id);
    setForm({
      asset_name: asset.asset_name,
      asset_code: asset.asset_code,
      category: asset.category,
      purchase_date: asset.purchase_date || '',
      warranty_expiry: asset.warranty_expiry || '',
      status: asset.status,
      assigned_to: asset.assigned_to || '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.asset_name.trim()) errs.asset_name = 'Required';
    if (!form.asset_code.trim()) errs.asset_code = 'Required';
    if (!form.category.trim()) errs.category = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const payload = { ...form, assigned_to: form.assigned_to || null };
    try {
      if (editingId) {
        await assetService.update(editingId, payload);
        toast.success('Asset updated successfully.');
      } else {
        await assetService.create(payload);
        toast.success('Asset created successfully.');
      }
      setModalOpen(false);
      fetchAssets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save asset.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await assetService.remove(deleteTarget.id);
      toast.success('Asset deleted.');
      setDeleteTarget(null);
      fetchAssets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete asset.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Asset Management</h1>
          <p className="text-gray-500 text-sm">Create, update, and monitor company assets.</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          + Add Asset
        </button>
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        statusOptions={STATUS_OPTIONS}
        status={status}
        onStatusChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        placeholder="Search by name or code..."
      />

      {loading ? (
        <Loading />
      ) : assets.length === 0 ? (
        <div className="card text-center text-gray-400 py-10">No assets found.</div>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{a.asset_name}</td>
                  <td className="py-3 px-4">{a.asset_code}</td>
                  <td className="py-3 px-4">{a.category}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="py-3 px-4">{a.assigned_to_name || '—'}</td>
                  <td className="py-3 px-4 flex gap-3">
                    <button className="text-brand-600 font-medium" onClick={() => openEdit(a)}>
                      Edit
                    </button>
                    <button className="text-red-500 font-medium" onClick={() => setDeleteTarget(a)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Asset' : 'Add Asset'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Asset Name</label>
            <input
              className="input"
              value={form.asset_name}
              onChange={(e) => setForm({ ...form, asset_name: e.target.value })}
            />
            {errors.asset_name && <p className="text-xs text-red-500 mt-1">{errors.asset_name}</p>}
          </div>
          <div>
            <label className="label">Asset Code</label>
            <input
              className="input"
              value={form.asset_code}
              onChange={(e) => setForm({ ...form, asset_code: e.target.value })}
            />
            {errors.asset_code && <p className="text-xs text-red-500 mt-1">{errors.asset_code}</p>}
          </div>
          <div>
            <label className="label">Category</label>
            <input
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. IT Equipment, HVAC, Furniture"
            />
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Purchase Date</label>
              <input
                type="date"
                className="input"
                value={form.purchase_date || ''}
                onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Warranty Expiry</label>
              <input
                type="date"
                className="input"
                value={form.warranty_expiry || ''}
                onChange={(e) => setForm({ ...form, warranty_expiry: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="in_maintenance">In Maintenance</option>
              <option value="retired">Retired</option>
            </select>
          </div>
          <div>
            <label className="label">Assign To (Employee)</label>
            <select
              className="input"
              value={form.assigned_to}
              onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
            >
              <option value="">Unassigned</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Saving...' : editingId ? 'Update Asset' : 'Create Asset'}
          </button>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Deletion" maxWidth="max-w-sm">
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete <span className="font-medium">{deleteTarget?.asset_name}</span>? This action
          cannot be undone.
        </p>
        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={() => setDeleteTarget(null)}>
            Cancel
          </button>
          <button className="btn-danger flex-1" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
