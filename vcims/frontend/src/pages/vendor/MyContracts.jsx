import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';

export default function MyContracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    setLoading(true);
    api.get('/contracts', { params: { page, limit: 8 } })
      .then((res) => {
        setContracts(res.data.data);
        setPagination(res.data.pagination);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load contracts.'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <DashboardLayout>
      <h2 className="text-xl font-bold text-slate-800 mb-4">My Contracts</h2>
      <ErrorMessage message={error} />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Start</th>
                <th className="py-2 pr-4">End</th>
                <th className="py-2 pr-4">Value</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 && (
                <tr><td colSpan="5" className="py-6 text-center text-slate-400">No contracts assigned yet.</td></tr>
              )}
              {contracts.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-medium text-slate-700">{c.contract_title}</td>
                  <td className="py-2 pr-4">{formatDate(c.start_date)}</td>
                  <td className="py-2 pr-4">{formatDate(c.end_date)}</td>
                  <td className="py-2 pr-4">{formatCurrency(c.contract_value)}</td>
                  <td className="py-2 pr-4"><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
        </div>
      )}
    </DashboardLayout>
  );
}
