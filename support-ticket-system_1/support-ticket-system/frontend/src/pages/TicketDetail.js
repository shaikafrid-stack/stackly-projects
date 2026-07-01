import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getTicket, addComment, updateTicket } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';

const statuses = ['open', 'in_progress', 'on_hold', 'resolved', 'closed'];

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTicket = useCallback(() => {
    setLoading(true);
    getTicket(id)
      .then(res => setTicket(res.data.ticket))
      .catch(() => { toast.error('Ticket not found or access denied'); navigate(-1); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => { fetchTicket(); }, [fetchTicket]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await addComment(id, { comment });
      setComment('');
      toast.success('Comment added');
      fetchTicket();
    } catch (err) { toast.error('Failed to add comment'); }
    finally { setSubmitting(false); }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTicket(id, { status: newStatus });
      toast.success('Status updated');
      fetchTicket();
    } catch (err) { toast.error('Failed to update status'); }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading ticket...</div>;
  if (!ticket) return null;

  const canUpdateStatus = user.role === 'admin' || (user.role === 'agent' && ticket.assigned_agent_id === user.id);
  const sla = ticket.sla;

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 mb-4">← Back</button>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">{ticket.ticket_title}</h1>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          #{ticket.id} · {ticket.category} · Opened by {ticket.customer?.name} on {new Date(ticket.created_at).toLocaleDateString()}
        </p>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{ticket.ticket_description}</p>

        <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Assigned Agent</p>
            <p className="text-gray-900 font-medium">{ticket.agent?.name || 'Unassigned'}</p>
          </div>
          {sla && (
            <div>
              <p className="text-gray-400">SLA Status</p>
              <p className={`font-medium ${sla.breached_status ? 'text-red-600' : 'text-green-600'}`}>
                {sla.breached_status ? 'Breached' : 'On Track'} · Resolve by {new Date(sla.resolution_deadline).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {canUpdateStatus && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <label className="text-sm font-medium text-gray-700 mr-2">Update status:</label>
            <select value={ticket.status} onChange={e => handleStatusChange(e.target.value)}
              className="text-sm rounded-md border border-gray-300 px-2 py-1.5 focus:ring-2 focus:ring-primary-500">
              {statuses.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Comments ({ticket.comments?.length || 0})</h2>
        <div className="space-y-4 mb-5">
          {ticket.comments?.length === 0 && <p className="text-sm text-gray-400">No comments yet.</p>}
          {ticket.comments?.map(c => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold shrink-0">
                {c.User?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{c.User?.name} <span className="text-xs text-gray-400 capitalize">({c.User?.role})</span></span>
                  <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.comment}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          <button type="submit" disabled={submitting} className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition disabled:opacity-60">
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </form>
      </div>
    </div>
  );
}
