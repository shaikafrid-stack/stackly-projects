import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import { StatusBadge, PriorityBadge } from '../../components/Badges';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const STATUS_OPTIONS = ['Open', 'In Progress', 'Resolved', 'Closed'];

export default function TicketDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [history, setHistory] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [assignedEngineer, setAssignedEngineer] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/tickets/${id}`);
      setTicket(data.ticket);
      setHistory(data.history);
      setStatus(data.ticket.status);
      setResolutionNotes(data.ticket.resolution_notes || '');
      setAssignedEngineer(data.ticket.assigned_engineer_id || '');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load ticket.');
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (user.role === 'admin' || user.role === 'support_engineer') {
      api.get('/users/engineers').then(({ data }) => setEngineers(data)).catch(() => {});
    }
  }, [user.role]);

  const isOwner = user.role === 'employee' && ticket?.employee_id === user.id;
  const isAssignedEngineer = user.role === 'support_engineer' && ticket?.assigned_engineer_id === user.id;
  const isAdmin = user.role === 'admin';
  const canManage = isAssignedEngineer || isAdmin;

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {};
      if (canManage) {
        payload.status = status;
        payload.resolution_notes = resolutionNotes;
        payload.assigned_engineer_id = assignedEngineer ? Number(assignedEngineer) : null;
      } else if (isOwner) {
        if (status === 'Closed') payload.status = 'Closed';
      }
      if (comment.trim()) payload.comment = comment.trim();

      await api.put(`/tickets/${id}`, payload);
      toast.success('Ticket updated.');
      setComment('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update ticket.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><Spinner /></Layout>;
  if (!ticket) return null;

  return (
    <Layout>
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-brand-600 mb-3">← Back</button>

      <div className="card mb-4">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold">{ticket.title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Raised by {ticket.employee_name} · {ticket.category}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>
        <p className="mt-4 text-sm whitespace-pre-wrap">{ticket.description}</p>
        {ticket.attachment_name && (
          <p className="mt-3 text-xs text-slate-500">📎 Attachment (mock): {ticket.attachment_name}</p>
        )}
        {ticket.resolution_notes && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-sm">
            <p className="font-medium text-emerald-800 dark:text-emerald-200 mb-1">Resolution Notes</p>
            <p className="whitespace-pre-wrap">{ticket.resolution_notes}</p>
          </div>
        )}
        <p className="mt-3 text-xs text-slate-400">
          Assigned engineer: {ticket.engineer_name || 'Unassigned'}
        </p>
      </div>

      {(canManage || isOwner) && (
        <div className="card mb-4">
          <h2 className="font-semibold mb-3">Manage Ticket</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {canManage && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reassign Engineer</label>
                  <select className="input" value={assignedEngineer} onChange={(e) => setAssignedEngineer(e.target.value)}>
                    <option value="">Unassigned</option>
                    {engineers.map((eng) => (
                      <option key={eng.id} value={eng.id}>{eng.name}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Resolution Notes</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Describe how the issue was resolved..."
                  />
                </div>
              </>
            )}
            {isOwner && ['Open', 'In Progress'].includes(ticket.status) && (
              <div>
                <label className="block text-sm font-medium mb-1">Close Ticket</label>
                <button
                  type="button"
                  onClick={() => setStatus('Closed')}
                  className={`btn ${status === 'Closed' ? 'btn-danger' : 'btn-secondary'}`}
                >
                  {status === 'Closed' ? 'Will close on save' : 'Mark as Closed'}
                </button>
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Add Comment</label>
              <textarea
                className="input"
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment or update..."
              />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary mt-4">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold mb-3">Ticket Status History</h2>
        {history.length === 0 ? (
          <p className="text-sm text-slate-500">No history yet.</p>
        ) : (
          <ul className="space-y-3">
            {history.map((h) => (
              <li key={h.id} className="border-l-2 border-brand-500 pl-3">
                <p className="text-sm">{h.comment}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {h.user_name} ({h.user_role.replace('_', ' ')}) · {new Date(h.created_at).toLocaleString()}
                  {h.status_at_comment ? ` · Status: ${h.status_at_comment}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
