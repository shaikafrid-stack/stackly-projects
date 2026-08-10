import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import FormInput from '../../components/FormInput.jsx';
import Button from '../../components/Button.jsx';

export default function MetadataEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState(null);
  const [owners, setOwners] = useState([]);
  const [form, setForm] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [bumpVersion, setBumpVersion] = useState(false);

  const load = async () => {
    try {
      const [{ data: ds }, { data: users }] = await Promise.all([
        api.get(`/datasets/${id}`),
        api.get('/users'),
      ]);
      setDataset(ds);
      setOwners(users);
      setForm({
        dataset_name: ds.dataset_name,
        description: ds.description || '',
        category: ds.category || '',
        data_source: ds.data_source || '',
        owner_id: ds.owner_id || '',
        status: ds.status,
      });
    } catch {
      toast.error('Failed to load dataset.');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/datasets/${id}`, { ...form, bumpVersion });
      toast.success('Metadata updated successfully.');
      setBumpVersion(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    try {
      await api.post(`/datasets/${id}/tags`, { tag_name: newTag.trim() });
      setNewTag('');
      load();
    } catch {
      toast.error('Failed to add tag.');
    }
  };

  const handleDeleteTag = async (tagId) => {
    try {
      await api.delete(`/datasets/${id}/tags/${tagId}`);
      load();
    } catch {
      toast.error('Failed to remove tag.');
    }
  };

  if (!dataset || !form) return <p className="text-slate-400">Loading...</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Metadata Editor</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <div className="card space-y-4">
        <FormInput label="Dataset Name" value={form.dataset_name} onChange={(e) => setForm({ ...form, dataset_name: e.target.value })} />
        <FormInput label="Description" as="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <FormInput label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <FormInput label="Data Source" value={form.data_source} onChange={(e) => setForm({ ...form, data_source: e.target.value })} />
        <FormInput
          label="Owner"
          as="select"
          value={form.owner_id}
          onChange={(e) => setForm({ ...form, owner_id: e.target.value })}
          options={[{ value: '', label: 'Unassigned' }, ...owners.map((o) => ({ value: o.id, label: `${o.name} (${o.role})` }))]}
        />
        <FormInput
          label="Status"
          as="select"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          options={[
            { value: 'Draft', label: 'Draft' },
            { value: 'Published', label: 'Published' },
            { value: 'Archived', label: 'Archived' },
          ]}
        />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={bumpVersion} onChange={(e) => setBumpVersion(e.target.checked)} />
          Bump version on save (current: {dataset.version})
        </label>
        <Button onClick={handleSave} loading={saving}>Save Changes</Button>
      </div>

      <div className="card space-y-3">
        <h3 className="font-semibold">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {dataset.tags.map((t) => (
            <span key={t.id} className="badge bg-brand-50 text-brand-700 gap-1">
              {t.tag_name}
              <button className="ml-1 text-brand-400 hover:text-red-500" onClick={() => handleDeleteTag(t.id)}>&times;</button>
            </span>
          ))}
          {dataset.tags.length === 0 && <p className="text-sm text-slate-400">No tags yet.</p>}
        </div>
        <div className="flex gap-2 max-w-sm">
          <FormInput value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="New tag" className="flex-1" />
          <Button variant="secondary" onClick={handleAddTag}>Add</Button>
        </div>
      </div>
    </div>
  );
}
