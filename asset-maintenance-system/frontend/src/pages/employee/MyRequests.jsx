import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { serviceRequestService } from '../../services/serviceRequestService';
import { StatusBadge, PriorityBadge } from '../../components/Badges';
import SearchFilterBar from '../../components/SearchFilterBar';
import Pagination from '../../components/Pagination';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';

const STATUS_OPTIONS = ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [selectedLoading, setSelectedLoading] = useState(false);

  const fetchRequests = () => {
    setLoading(true);
    serviceRequestService
      .getAll({ search, status, priority, page, limit: 8 })
      .then((res) => {
        setRequests(res.data.data);
        setMeta(res.data.meta);
      })
      .catch(() => toast.error('Failed to load requests.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, priority, page]);

  const openDetail = async (id) => {
    setSelectedLoading(true);
    try {
      const res = await serviceRequestService.getById(id);
      setSelected(res.data.data);
    } catch {
      toast.error('Failed to load request details.');
    } finally {
      setSelectedLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-1">My Requests</h1>
      <p className="text-gray-500 text-sm mb-6">Track the status of your submitted service requests.</p>

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
        <div className="card text-center text-gray-400 py-10">No service requests found.</div>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-3 px-4">Issue</th>
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{r.issue_title}</td>
                  <td className="py-3 px-4">{r.asset_name}</td>
                  <td className="py-3 px-4">
                    <PriorityBadge priority={r.priority} />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-3 px-4 text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <button className="text-brand-600 font-medium" onClick={() => openDetail(r.id)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Service Request Details">
        {selectedLoading || !selected ? (
          <Loading />
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <PriorityBadge priority={selected.priority} />
              <StatusBadge status={selected.status} />
            </div>
            <p>
              <span className="font-medium">Issue:</span> {selected.issue_title}
            </p>
            <p>
              <span className="font-medium">Description:</span> {selected.issue_description || '—'}
            </p>
            <p>
              <span className="font-medium">Asset:</span> {selected.asset_name} ({selected.asset_code})
            </p>
            <p>
              <span className="font-medium">Assigned Engineer:</span> {selected.engineer_name || 'Not yet assigned'}
            </p>
            <p>
              <span className="font-medium">Raised:</span> {new Date(selected.created_at).toLocaleString()}
            </p>

            <div>
              <p className="font-medium mb-2">Maintenance Logs</p>
              {selected.maintenance_logs?.length ? (
                <ul className="space-y-2">
                  {selected.maintenance_logs.map((log) => (
                    <li key={log.id} className="border border-gray-200 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">
                        {log.engineer_name} · {log.resolved_at ? new Date(log.resolved_at).toLocaleString() : 'In progress'}
                      </p>
                      {log.maintenance_notes && <p>Notes: {log.maintenance_notes}</p>}
                      {log.resolution_summary && <p>Resolution: {log.resolution_summary}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No maintenance logs yet.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
