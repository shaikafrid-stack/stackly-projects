import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { serviceRequestService } from '../../services/serviceRequestService';
import { maintenanceService } from '../../services/maintenanceService';
import { StatusBadge, PriorityBadge } from '../../components/Badges';
import SearchFilterBar from '../../components/SearchFilterBar';
import Pagination from '../../components/Pagination';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';

const STATUS_OPTIONS = ['Assigned', 'In Progress', 'Resolved', 'Closed'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];

export default function AssignedRequests() {
  const [requests, setRequests] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);

  const [logModal, setLogModal] = useState(null); // request being logged
  const [logForm, setLogForm] = useState({ maintenance_notes: '', resolution_summary: '', mark_resolved: false });
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = () => {
    setLoading(true);
    serviceRequestService
      .getAll({ search, status, priority, page, limit: 8 })
      .then((res) => {
        setRequests(res.data.data);
        setMeta(res.data.meta);
      })
      .catch(() => toast.error('Failed to load assigned requests.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, priority, page]);

  const updateStatus = async (id, newStatus) => {
    try {
      await serviceRequestService.update(id, { status: newStatus });
      toast.success(`Status updated to "${newStatus}"`);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const openLogModal = (request) => {
    setLogModal(request);
    setLogForm({ maintenance_notes: '', resolution_summary: '', mark_resolved: false });
  };

  const submitLog = async (e) => {
    e.preventDefault();
    if (logForm.mark_resolved && !logForm.resolution_summary.trim()) {
      toast.error('Resolution summary is required to mark as resolved.');
      return;
    }
    setSubmitting(true);
    try {
      await maintenanceService.create({ request_id: logModal.id, ...logForm });
      toast.success('Maintenance log saved.');
      setLogModal(null);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save maintenance log.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-1">Assigned Requests</h1>
      <p className="text-gray-500 text-sm mb-6">Update status and log maintenance work for your requests.</p>

      <SearchFilterBar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        statusOptions={STATUS_OPTIONS}
        status={status}
        onStatusChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        priorityOptions={PRIORITY_OPTIONS}
        priority={priority}
        onPriorityChange={(v) => {
          setPriority(v);
          setPage(1);
        }}
        placeholder="Search by issue title..."
      />

      {loading ? (
        <Loading />
      ) : requests.length === 0 ? (
        <div className="card text-center text-gray-400 py-10">No requests assigned to you.</div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="card flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <PriorityBadge priority={r.priority} />
                  <StatusBadge status={r.status} />
                </div>
                <p className="font-medium">{r.issue_title}</p>
                <p className="text-sm text-gray-500">
                  {r.asset_name} ({r.asset_code}) · Raised by {r.employee_name}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {r.status === 'Assigned' && (
                  <button className="btn-secondary" onClick={() => updateStatus(r.id, 'In Progress')}>
                    Start Work
                  </button>
                )}
                <button className="btn-primary" onClick={() => openLogModal(r)}>
                  Add Maintenance Log
                </button>
                {r.status === 'Resolved' && (
                  <button className="btn-secondary" onClick={() => updateStatus(r.id, 'Closed')}>
                    Close Request
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />

      <Modal open={!!logModal} onClose={() => setLogModal(null)} title={`Log Maintenance — ${logModal?.issue_title || ''}`}>
        <form onSubmit={submitLog} className="space-y-4">
          <div>
            <label className="label">Maintenance Notes</label>
            <textarea
              className="input"
              rows={3}
              value={logForm.maintenance_notes}
              onChange={(e) => setLogForm({ ...logForm, maintenance_notes: e.target.value })}
              placeholder="Diagnostics performed, parts replaced, etc."
            />
          </div>
          <div>
            <label className="label">Resolution Summary</label>
            <textarea
              className="input"
              rows={3}
              value={logForm.resolution_summary}
              onChange={(e) => setLogForm({ ...logForm, resolution_summary: e.target.value })}
              placeholder="Required only if marking as resolved"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={logForm.mark_resolved}
              onChange={(e) => setLogForm({ ...logForm, mark_resolved: e.target.checked })}
            />
            Mark this request as Resolved
          </label>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Saving...' : 'Save Log'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
