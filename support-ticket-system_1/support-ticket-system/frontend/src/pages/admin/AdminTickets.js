import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getTickets, updateTicket, deleteTicket, getAgents } from '../../services/api';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { SkeletonRow } from '../../components/common/Skeleton';
import Pagination from '../../components/common/Pagination';

const statuses = ['open', 'in_progress', 'on_hold', 'resolved', 'closed'];

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchTickets = useCallback(() => {
    setLoading(true);
    getTickets({ search, status, priority, page, limit: 8 })
      .then(res => { setTickets(res.data.tickets); setPages(res.data.pages); })
      .finally(() => setLoading(false));
  }, [search, status, priority, page]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);
  useEffect(() => { setPage(1); }, [search, status, priority]);
  useEffect(() => { getAgents().then(res => setAgents(res.data.agents)); }, []);

  const handleAssign = async (id, agentId) => {
    try {
      await updateTicket(id, { assigned_agent_id: agentId || null });
      toast.success('Ticket reassigned');
      fetchTickets();
    } catch (err) { toast.error('Failed to assign'); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateTicket(id, { status: newStatus });
      toast.success('Status updated');
      fetchTickets();
    } catch (err) { toast.error('Failed to update status'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket permanently?')) return;
    try {
      await deleteTicket(id);
      toast.success('Ticket deleted');
      fetchTickets();
    } catch (err) { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All Tickets</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets..."
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
        <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm">
          <option value="">All Status</option>
          {statuses.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
        <select value={priority} onChange={e => setPriority(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm">
          <option value="">All Priority</option>
          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? [1,2,3,4].map(i => <SkeletonRow key={i} />) :
              tickets.length === 0 ? <tr><td colSpan={6} className="text-center py-10 text-gray-400">No tickets found.</td></tr> :
              tickets.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><Link to={`/tickets/${t.id}`} className="font-medium text-gray-900 hover:text-primary-600">{t.ticket_title}</Link></td>
                  <td className="px-4 py-3 text-gray-600">{t.customer?.name}</td>
                  <td className="px-4 py-3">
                    <select value={t.assigned_agent_id || ''} onChange={e => handleAssign(t.id, e.target.value)}
                      className="text-xs rounded-md border border-gray-300 px-2 py-1.5 focus:ring-2 focus:ring-primary-500">
                      <option value="">Unassigned</option>
                      {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                  <td className="px-4 py-3">
                    <select value={t.status} onChange={e => handleStatusChange(t.id, e.target.value)}
                      className="text-xs rounded-md border border-gray-300 px-2 py-1.5 focus:ring-2 focus:ring-primary-500">
                      {statuses.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(t.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}
