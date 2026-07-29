import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import Pagination from '../../components/Pagination';
import { StatusBadge, PriorityBadge } from '../../components/Badges';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const STATUS_OPTIONS = ['Open', 'In Progress', 'Resolved', 'Closed'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

export default function TicketList() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ search: '', category: '', priority: '', status: '' });

  const fetchTickets = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.priority) params.priority = filters.priority;
      if (filters.status) params.status = filters.status;

      const { data } = await api.get('/tickets', { params });
      setTickets(data.data);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => {
    fetchTickets(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const title = user.role === 'employee' ? 'My Tickets' : user.role === 'support_engineer' ? 'Assigned Tickets' : 'All Tickets';

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-xl font-bold">{title}</h1>
        {user.role === 'employee' && (
          <Link to="/tickets/new" className="btn btn-primary">+ New Ticket</Link>
        )}
      </div>

      <div className="card mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            className="input"
            placeholder="Search by title..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            className="input"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.category_name}>{c.category_name}</option>
            ))}
          </select>
          <select
            className="input"
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          >
            <option value="">All Priorities</option>
            {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select
            className="input"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : tickets.length === 0 ? (
        <div className="card text-center text-slate-500">No tickets found.</div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {user.role !== 'employee' && <th className="px-4 py-3 font-medium">Employee</th>}
                {user.role === 'admin' && <th className="px-4 py-3 font-medium">Engineer</th>}
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3">
                    <Link to={`/tickets/${t.id}`} className="font-medium hover:text-brand-600">
                      {t.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{t.category}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  {user.role !== 'employee' && <td className="px-4 py-3">{t.employee_name}</td>}
                  {user.role === 'admin' && <td className="px-4 py-3">{t.engineer_name || '—'}</td>}
                  <td className="px-4 py-3 text-slate-500">{new Date(t.updated_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={fetchTickets} />
    </Layout>
  );
}
