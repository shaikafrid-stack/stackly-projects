import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Badge from '../components/Badge';
import Pagination from '../components/Pagination';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';

export default function Regularization() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const limit = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/regularization', { params });
      setRequests(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      toast.error('Failed to load regularization requests.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDecision = async (id, decision) => {
    const comment = window.prompt(`Add a comment for this ${decision} (optional):`) || '';
    try {
      await api.put(`/regularization/${id}/${decision}`, { manager_comments: comment });
      toast.success(`Request ${decision}d.`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
  };

  const canApprove = user?.role === 'manager' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Regularization Requests</h1>
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <Loading />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-left text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Attendance Date</th>
                <th className="px-6 py-3">Reason</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Manager Comments</th>
                {canApprove && <th className="px-6 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {requests.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-3">{r.employee_name}</td>
                  <td className="px-6 py-3">{r.attendance_date}</td>
                  <td className="px-6 py-3 max-w-xs truncate" title={r.reason}>
                    {r.reason}
                  </td>
                  <td className="px-6 py-3">
                    <Badge status={r.status} />
                  </td>
                  <td className="px-6 py-3 text-gray-500 dark:text-gray-400">{r.manager_comments || '—'}</td>
                  {canApprove && (
                    <td className="px-6 py-3">
                      {r.status === 'Pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDecision(r.id, 'approve')}
                            className="text-green-600 hover:underline text-xs font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleDecision(r.id, 'reject')}
                            className="text-red-600 hover:underline text-xs font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Resolved</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No regularization requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        <div className="px-6 pb-4">
          <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
