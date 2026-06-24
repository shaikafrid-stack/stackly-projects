import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { PageHeader, StatusBadge, LoadingSpinner, Pagination, EmptyState } from '../../components/shared/UIComponents';
import { Check, X } from 'lucide-react';

export default function LeaveApproval() {
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const fetch = (p = 0) => {
    setLoading(true);
    leaveAPI.allLeaves({ page: p, size: 10, status: statusFilter })
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(page); }, [page, statusFilter]);

  const handleAction = async (id, action) => {
    setActionLoading(prev => ({...prev, [id]: action}));
    try {
      if (action === 'approve') await leaveAPI.approve(id);
      else await leaveAPI.reject(id);
      toast.success(`Leave ${action}d successfully`);
      fetch(page);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action}`);
    } finally {
      setActionLoading(prev => ({...prev, [id]: null}));
    }
  };

  return (
    <div>
      <PageHeader title="Leave Approvals" subtitle="Review and manage employee leave requests" />
      <div className="mb-4 flex gap-3">
        {['', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(0); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              statusFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? <LoadingSpinner /> : data.content.length === 0 ? <EmptyState /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Employee', 'Type', 'From', 'To', 'Reason', 'Applied', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.content.map(lr => (
                  <tr key={lr.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{lr.employeeName}</td>
                    <td className="px-4 py-3 text-gray-600">{lr.leaveType}</td>
                    <td className="px-4 py-3 text-gray-600">{lr.startDate}</td>
                    <td className="px-4 py-3 text-gray-600">{lr.endDate}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{lr.reason}</td>
                    <td className="px-4 py-3 text-gray-500">{lr.appliedAt?.split('T')[0]}</td>
                    <td className="px-4 py-3"><StatusBadge status={lr.status} /></td>
                    <td className="px-4 py-3">
                      {lr.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleAction(lr.id, 'approve')}
                            disabled={actionLoading[lr.id]}
                            className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50">
                            <Check size={14} />
                          </button>
                          <button onClick={() => handleAction(lr.id, 'reject')}
                            disabled={actionLoading[lr.id]}
                            className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50">
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4">
          <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
