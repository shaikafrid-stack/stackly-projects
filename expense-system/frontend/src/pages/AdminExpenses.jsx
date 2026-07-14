import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import FilterBar from '../components/FilterBar';
import ExpenseTable from '../components/ExpenseTable';
import api from '../services/api';

function toCSV(rows) {
  const header = ['Employee', 'Title', 'Category', 'Amount', 'Date', 'Status', 'Comments'];
  const lines = rows.map((r) =>
    [r.employee_name, r.title, r.category, r.amount, r.expense_date, r.status, r.manager_comments || '']
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );
  return [header.join(','), ...lines].join('\n');
}

export default function AdminExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
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

  async function handleExport() {
    try {
      const res = await api.get('/expenses', { params: { ...filters, limit: 1000, page: 1 } });
      const csv = toCSV(res.data.data);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'expenses.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported to CSV.');
    } catch {
      toast.error('Could not export expenses.');
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">All Expenses</h1>
          <button className="btn-secondary text-sm" onClick={handleExport}>Export CSV</button>
        </div>
        <div className="card">
          <FilterBar filters={filters} setFilters={setFilters} />
          {loading ? (
            <div className="text-gray-400 text-sm py-8 text-center">Loading expenses...</div>
          ) : (
            <>
              <ExpenseTable expenses={expenses} showEmployee />
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
    </div>
  );
}
