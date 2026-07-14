import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import FilterBar from '../components/FilterBar';
import ExpenseTable from '../components/ExpenseTable';
import RejectModal from '../components/RejectModal';
import api from '../services/api';

export default function ManagerExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '', category: '', order: 'desc', page: 1 });

  const load = useCallback(() => {
    setLoading(true);
    api
      .get('/expenses', { params: { ...filters, sortBy: 'expense_date', limit: 10 } })
      .then((res) => {
        setExpenses(res.data.data);
        setPagination(res.data.pagination);
      })
      .catch(() => toast.error('Could not load expenses.'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  async function handleApprove(exp) {
    if (!confirm(`Approve "${exp.title}" for ₹${exp.amount}?`)) return;
    try {
      await api.put(`/expenses/${exp.id}/approve`, {});
      toast.success('Expense approved.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not approve expense.');
    }
  }

  async function confirmReject(comments) {
    try {
      await api.put(`/expenses/${rejecting.id}/reject`, { comments });
      toast.success('Expense rejected.');
      setRejecting(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not reject expense.');
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold mb-6">Review Requests</h1>
        <div className="card">
          <FilterBar filters={filters} setFilters={setFilters} />
          {loading ? (
            <div className="text-gray-400 text-sm py-8 text-center">Loading expenses...</div>
          ) : (
            <>
              <ExpenseTable
                expenses={expenses}
                showEmployee
                onApprove={handleApprove}
                onReject={(exp) => setRejecting(exp)}
              />
              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setFilters({ ...filters, page: p })}
                      className={`w-8 h-8 rounded-lg text-sm ${
                        p === pagination.page ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {rejecting && (
        <RejectModal expense={rejecting} onClose={() => setRejecting(null)} onConfirm={confirmReject} />
      )}
    </div>
  );
}
