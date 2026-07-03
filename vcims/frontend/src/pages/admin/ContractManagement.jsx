import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce';
import { formatCurrency, formatDate } from '../../utils/format';

const EMPTY_FORM = { vendor_id: '', contract_title: '', start_date: '', end_date: '', contract_value: '', status: 'draft' };

export default function ContractManagement() {
  const [contracts, setContracts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    api.get('/vendors', { params: { limit: 100 } }).then((res) => setVendors(res.data.data)).catch(() => {});
  }, []);

  const loadContracts = () => {
    setLoading(true);
    setError('');
    api.get('/contracts', { params: { search: debouncedSearch, status, page, limit: 8 } })
      .then((res) => {
        setContracts(res.data.data);
        setPagination(res.data.pagination);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load contracts.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadContracts(); /* eslint-disable-next-line */ }, [debouncedSearch, status, page]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({
      vendor_id: c.vendor_id,
      contract_title: c.contract_title,
      start_date: c.start_date?.slice(0, 10) || '',
      end_date: c.end_date?.slice(0, 10) || '',
      contract_value: c.contract_value,
      status: c.status,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!editingId && !form.vendor_id) return 'Please select a vendor.';
    if (!form.contract_title.trim()) return 'Contract title is required.';
    if (!form.start_date || !form.end_date) return 'Start and end dates are required.';
    if (new Date(form.end_date) < new Date(form.start_date)) return 'End date cannot be before start date.';
    if (form.contract_value && Number(form.contract_value) < 0) return 'Contract value cannot be negative.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setFormError(validationError); return; }
    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        await api.put(`/contracts/${editingId}`, form);
      } else {
        await api.post('/contracts', form);
      }
      setShowModal(false);
      loadContracts();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save contract.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contract? Related invoices will also be removed.')) return;
    try {
      await api.delete(`/contracts/${id}`);
      loadContracts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete contract.');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">Contract Management</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ New Contract</button>
      </div>

      <div className="card mb-4 flex flex-col sm:flex-row gap-3">
        <input
          className="input sm:max-w-xs"
          placeholder="Search by title or vendor..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select className="input sm:max-w-[180px]" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Vendor</th>
                <th className="py-2 pr-4">Start</th>
                <th className="py-2 pr-4">End</th>
                <th className="py-2 pr-4">Value</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 && (
                <tr><td colSpan="7" className="py-6 text-center text-slate-400">No contracts found.</td></tr>
              )}
              {contracts.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-medium text-slate-700">{c.contract_title}</td>
                  <td className="py-2 pr-4">{c.vendor_name}</td>
                  <td className="py-2 pr-4">{formatDate(c.start_date)}</td>
                  <td className="py-2 pr-4">{formatDate(c.end_date)}</td>
                  <td className="py-2 pr-4">{formatCurrency(c.contract_value)}</td>
                  <td className="py-2 pr-4"><StatusBadge status={c.status} /></td>
                  <td className="py-2 pr-4 space-x-2">
                    <button className="text-primary-600 font-medium" onClick={() => openEdit(c)}>Edit</button>
                    <button className="text-red-600 font-medium" onClick={() => handleDelete(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-lg text-slate-800 mb-4">{editingId ? 'Edit Contract' : 'New Contract'}</h3>
            <ErrorMessage message={formError} />
            <form onSubmit={handleSubmit} className="space-y-3">
              {!editingId && (
                <div>
                  <label className="label">Vendor *</label>
                  <select className="input" name="vendor_id" value={form.vendor_id} onChange={handleChange}>
                    <option value="">Select vendor</option>
                    {vendors.map((v) => <option key={v.id} value={v.id}>{v.vendor_name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="label">Contract Title *</label>
                <input className="input" name="contract_title" value={form.contract_title} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Start Date *</label>
                  <input type="date" className="input" name="start_date" value={form.start_date} onChange={handleChange} />
                </div>
                <div>
                  <label className="label">End Date *</label>
                  <input type="date" className="input" name="end_date" value={form.end_date} onChange={handleChange} />
                </div>
              </div>
              <div>
                <label className="label">Contract Value (INR)</label>
                <input type="number" min="0" className="input" name="contract_value" value={form.contract_value} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" name="status" value={form.status} onChange={handleChange}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
