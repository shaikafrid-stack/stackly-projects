import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import api from '../../api/axios';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ category_name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/categories').then(({ data }) => setCategories(data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ category_name: '', description: '' }); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category_name.trim()) {
      toast.error('Category name is required.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
        toast.success('Category updated.');
      } else {
        await api.post('/categories', form);
        toast.success('Category created.');
      }
      resetForm();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setForm({ category_name: c.category_name, description: c.description || '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category.');
    }
  };

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Ticket Category Management</h1>

      <form onSubmit={handleSubmit} className="card mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Category Name</label>
          <input
            className="input"
            value={form.category_name}
            onChange={(e) => setForm({ ...form, category_name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <input
            className="input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {editingId ? 'Update' : 'Add'} Category
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel</button>
          )}
        </div>
      </form>

      {loading ? (
        <Spinner />
      ) : (
        <div className="card !p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium">{c.category_name}</td>
                  <td className="px-4 py-3 text-slate-500">{c.description}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => handleEdit(c)} className="btn btn-secondary !px-3 !py-1 text-xs">Edit</button>
                    <button onClick={() => handleDelete(c.id)} className="btn btn-danger !px-3 !py-1 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
