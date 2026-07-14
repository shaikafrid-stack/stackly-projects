import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import FilterBar from '../components/FilterBar';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseForm from '../components/ExpenseForm';
import api from '../services/api';

export default function EmployeeExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
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

  async function handleCancel(exp) {
    if (!confirm(`Cancel "${exp.title}"?`)) return;
    try {
      await api.delete(`/expenses/${exp.id}`);
      toast.success('Expense cancelled.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel expense.');
    }
  }

  function handleEdit(exp) {
    setEditing(exp);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  function onSaved() {
    closeForm();
    load();
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">My Expenses</h1>
          <button className="btn-primary text-sm" onClick={() => setShowForm(true)}>
            + New Expense
          </button>
        </div>
        <div className="card">
          <FilterBar filters={filters} setFilters={setFilters} />
          {loading ? (
            <div className="text-gray-400 text-sm py-8 text-center">Loading expenses...</div>
          ) : (
            <>
              <ExpenseTable expenses={expenses} onEdit={handleEdit} onCancel={handleCancel} />
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
      {showForm && <ExpenseForm existing={editing} onClose={closeForm} onSaved={onSaved} />}
    </div>
  );
}
