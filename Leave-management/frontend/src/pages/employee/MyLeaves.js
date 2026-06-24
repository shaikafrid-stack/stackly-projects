import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/api';
import { PageHeader, StatusBadge, LoadingSpinner, Pagination, EmptyState } from '../../components/shared/UIComponents';

export default function MyLeaves() {
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = (p = 0) => {
    setLoading(true);
    leaveAPI.myLeaves({ page: p, size: 10 })
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(page); }, [page]);

  return (
    <div>
      <PageHeader title="My Leave Requests" subtitle="Track all your leave history" />
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? <LoadingSpinner /> : data.content.length === 0 ? <EmptyState message="No leave requests found" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['#', 'Type', 'Start', 'End', 'Reason', 'Applied On', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.content.map((lr, i) => (
                  <tr key={lr.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{lr.leaveType}</td>
                    <td className="px-4 py-3 text-gray-600">{lr.startDate}</td>
                    <td className="px-4 py-3 text-gray-600">{lr.endDate}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{lr.reason}</td>
                    <td className="px-4 py-3 text-gray-500">{lr.appliedAt?.split('T')[0]}</td>
                    <td className="px-4 py-3"><StatusBadge status={lr.status} /></td>
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
