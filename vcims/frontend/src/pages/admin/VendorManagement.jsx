import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce';

const EMPTY_FORM = { vendor_name: '', contact_person: '', phone: '', email: '', address: '', status: 'active' };

export default function VendorManagement() {
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

  const loadVendors = () => {
    setLoading(true);
    setError('');
    api.get('/vendors', { params: { search: debouncedSearch, status, page, limit: 8 } })
      .then((res) => {
        setVendors(res.data.data);
        setPagination(res.data.pagination);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load vendors.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadVendors(); /* eslint-disable-next-line */ }, [debouncedSearch, status, page]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (vendor) => {
    setEditingId(vendor.id);
    setForm({
      vendor_name: vendor.vendor_name || '',
      contact_person: vendor.contact_person || '',
      phone: vendor.phone || '',
      email: vendor.email || '',
      address: vendor.address || '',
      status: vendor.status || 'active',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vendor_name.trim()) {
      setFormError('Vendor name is required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        await api.put(`/vendors/${editingId}`, form);
      } else {
        await api.post('/vendors', form);
      }
      setShowModal(false);
      loadVendors();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save vendor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vendor? This will also remove related contracts and invoices.')) return;
    try {
      await api.delete(`/vendors/${id}`);
      loadVendors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete vendor.');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">Vendor Management</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Vendor</button>
      </div>

      <div className="card mb-4 flex flex-col sm:flex-row gap-3">
        <input
          className="input sm:max-w-xs"
          placeholder="Search by name, contact, email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select className="input sm:max-w-[180px]" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="blacklisted">Blacklisted</option>
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
                <th className="py-2 pr-4">Vendor Name</th>
                <th className="py-2 pr-4">Contact Person</th>
                <th className="py-2 pr-4">Phone</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 && (
                <tr><td colSpan="6" className="py-6 text-center text-slate-400">No vendors found.</td></tr>
              )}
              {vendors.map((v) => (
                <tr key={v.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-medium text-slate-700">{v.vendor_name}</td>
                  <td className="py-2 pr-4">{v.contact_person || '-'}</td>
                  <td className="py-2 pr-4">{v.phone || '-'}</td>
                  <td className="py-2 pr-4">{v.email || '-'}</td>
                  <td className="py-2 pr-4"><StatusBadge status={v.status} /></td>
                  <td className="py-2 pr-4 space-x-2">
                    <button className="text-primary-600 font-medium" onClick={() => openEdit(v)}>Edit</button>
                    <button className="text-red-600 font-medium" onClick={() => handleDelete(v.id)}>Delete</button>
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
            <h3 className="font-semibold text-lg text-slate-800 mb-4">{editingId ? 'Edit Vendor' : 'Add Vendor'}</h3>
            <ErrorMessage message={formError} />
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="label">Vendor Name *</label>
                <input className="input" name="vendor_name" value={form.vendor_name} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Contact Person</label>
                <input className="input" name="contact_person" value={form.contact_person} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" name="phone" value={form.phone} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" name="email" value={form.email} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Address</label>
                <input className="input" name="address" value={form.address} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" name="status" value={form.status} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blacklisted">Blacklisted</option>
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
