import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function CreateTicket() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', category: '', priority: 'Low', attachment_name: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    if (!form.description.trim()) e.description = 'Description is required.';
    if (!form.category) e.category = 'Please select a category.';
    if (!form.priority) e.priority = 'Please select a priority.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, attachment_name: file ? file.name : '' });
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/tickets', form);
      toast.success('Ticket created successfully!');
      navigate(`/tickets/${data.ticketId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Create Helpdesk Ticket</h1>
      <form onSubmit={handleSubmit} className="card max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Ticket Title</label>
          <input
            className="input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Cannot connect to VPN"
          />
          {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.category_name}>{c.category_name}</option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-rose-600 mt-1">{errors.category}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              className="input"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="input"
            rows={5}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the issue in detail..."
          />
          {errors.description && <p className="text-xs text-rose-600 mt-1">{errors.description}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Attachment (mock upload)</label>
          <input type="file" className="input" onChange={handleFileChange} />
          {form.attachment_name && (
            <p className="text-xs text-slate-500 mt-1">Selected: {form.attachment_name}</p>
          )}
        </div>

        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </form>
    </Layout>
  );
}
