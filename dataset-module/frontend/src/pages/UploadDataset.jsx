import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { uploadDataset } from '../api/datasets';
import { useToast } from '../context/ToastContext';

export default function UploadDataset() {
  const [form, setForm] = useState({ name: '', description: '', category: '', tags: '' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx'].includes(ext)) {
      setError('Only .csv and .xlsx files are supported.');
      setFile(null);
      return;
    }
    setError('');
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Dataset name is required.');
    if (!file) return setError('Please select a file to upload.');

    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('file', file);
      const dataset = await uploadDataset(fd);
      showToast('Dataset uploaded successfully', 'success');
      navigate(`/datasets/${dataset.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Upload Dataset</h1>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Dataset Name *</label>
            <input
              name="name" value={form.name} onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Description</label>
            <textarea
              name="description" value={form.description} onChange={handleChange} rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Category</label>
              <input
                name="category" value={form.category} onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Tags</label>
              <input
                name="tags" value={form.tags} onChange={handleChange} placeholder="comma,separated,tags"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">File Upload * (.csv or .xlsx)</label>
            <input type="file" accept=".csv,.xlsx" onChange={handleFileChange} className="text-sm" />
            {file && <p className="text-xs text-gray-500 mt-1">{file.name} · {(file.size / 1024).toFixed(1)} KB</p>}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-brand-600 text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? 'Uploading...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}
