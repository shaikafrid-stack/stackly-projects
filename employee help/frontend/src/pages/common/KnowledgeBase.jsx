import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import Pagination from '../../components/Pagination';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const emptyForm = { id: null, title: '', category: '', content: '' };

export default function KnowledgeBase() {
  const { user } = useAuth();
  const canManage = user.role === 'support_engineer' || user.role === 'admin';

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchArticles = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 8 };
      if (search) params.search = search;
      if (category) params.category = category;
      const { data } = await api.get('/articles', { params });
      setArticles(data.data);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => { fetchArticles(1); }, [fetchArticles]);

  const openCreate = () => { setForm(emptyForm); setShowForm(true); };
  const openEdit = (a) => { setForm({ id: a.id, title: a.title, category: a.category, content: a.content }); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.content) {
      toast.error('All fields are required.');
      return;
    }
    setSaving(true);
    try {
      if (form.id) {
        await api.put(`/articles/${form.id}`, form);
        toast.success('Article updated.');
      } else {
        await api.post('/articles', form);
        toast.success('Article created.');
      }
      setShowForm(false);
      fetchArticles(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save article.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article? This cannot be undone.')) return;
    try {
      await api.delete(`/articles/${id}`);
      toast.success('Article deleted.');
      fetchArticles(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete article.');
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-xl font-bold">Knowledge Base</h1>
        {canManage && (
          <button onClick={openCreate} className="btn btn-primary">+ New Article</button>
        )}
      </div>

      <div className="card mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            className="input"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.category_name}>{c.category_name}</option>)}
          </select>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-4 space-y-3">
          <h2 className="font-semibold">{form.id ? 'Edit Article' : 'New Article'}</h2>
          <input
            className="input"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <select
            className="input"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.category_name}>{c.category_name}</option>)}
          </select>
          <textarea
            className="input"
            rows={5}
            placeholder="Content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Saving...' : 'Save Article'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <Spinner />
      ) : articles.length === 0 ? (
        <div className="card text-center text-slate-500">No articles found.</div>
      ) : (
        <div className="space-y-3">
          {articles.map((a) => (
            <div key={a.id} className="card">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <button
                    className="font-semibold text-left hover:text-brand-600"
                    onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                  >
                    {a.title}
                  </button>
                  <p className="text-xs text-slate-500 mt-1">{a.category} · by {a.author_name}</p>
                </div>
                {canManage && (
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(a)} className="btn btn-secondary !px-3 !py-1 text-xs">Edit</button>
                    {user.role === 'admin' && (
                      <button onClick={() => handleDelete(a.id)} className="btn btn-danger !px-3 !py-1 text-xs">Delete</button>
                    )}
                  </div>
                )}
              </div>
              {expanded === a.id && (
                <p className="mt-3 text-sm whitespace-pre-wrap border-t border-slate-100 dark:border-slate-700 pt-3">
                  {a.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={fetchArticles} />
    </Layout>
  );
}
