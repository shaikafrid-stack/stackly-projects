import React, { useState, useEffect } from 'react';
import { projectAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { PageHeader, StatusBadge, LoadingSpinner, Pagination, EmptyState } from '../../components/shared/UIComponents';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';

export default function ProjectManagement() {
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | project obj
  const [form, setForm] = useState({ projectName: '', description: '', startDate: '', endDate: '', status: 'ACTIVE' });
  const [saving, setSaving] = useState(false);

  const fetch = (p = 0) => {
    setLoading(true);
    projectAPI.getAll({ page: p, size: 10, search })
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(page); }, [page, search]);

  const openCreate = () => {
    setForm({ projectName: '', description: '', startDate: '', endDate: '', status: 'ACTIVE' });
    setModal('create');
  };

  const openEdit = (p) => {
    setForm({ projectName: p.projectName, description: p.description || '', startDate: p.startDate || '', endDate: p.endDate || '', status: p.status });
    setModal(p);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.projectName || !form.startDate) { toast.error('Name and start date are required'); return; }
    setSaving(true);
    try {
      if (modal === 'create') await projectAPI.create(form);
      else await projectAPI.update(modal.id, form);
      toast.success(modal === 'create' ? 'Project created!' : 'Project updated!');
      setModal(null);
      fetch(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete project "${name}"?`)) return;
    try {
      await projectAPI.delete(id);
      toast.success('Project deleted');
      fetch(page);
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <PageHeader
        title="Project Management"
        subtitle="Manage all company projects"
        action={
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={16} /> New Project
          </button>
        }
      />

      <div className="mb-4 relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? <LoadingSpinner /> : data.content.length === 0 ? <EmptyState message="No projects found" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Name', 'Description', 'Start', 'End', 'Status', 'Team', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.content.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.projectName}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{p.description || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.startDate || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.endDate || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-gray-600">{p.employeeCount} members</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(p.id, p.projectName)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4">
          <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-800 text-lg">{modal === 'create' ? 'New Project' : 'Edit Project'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              {[
                { label: 'Project Name', key: 'projectName', type: 'text' },
                { label: 'Description', key: 'description', type: 'textarea' },
                { label: 'Start Date', key: 'startDate', type: 'date' },
                { label: 'End Date', key: 'endDate', type: 'date' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  {type === 'textarea' ? (
                    <textarea value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  ) : (
                    <input type={type} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  )}
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ON_HOLD">On Hold</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
