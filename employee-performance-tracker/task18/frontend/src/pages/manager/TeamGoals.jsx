import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import GoalTable from '../../components/GoalTable';
import GoalFormModal from '../../components/GoalFormModal';
import ReviewFormModal from '../../components/ReviewFormModal';
import Spinner from '../../components/Spinner';
import ErrorBanner from '../../components/ErrorBanner';

export default function TeamGoals() {
  const [goals, setGoals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', sort: 'target_date', order: 'asc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [reviewGoal, setReviewGoal] = useState(null);

  const fetchGoals = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/goals', { params: { ...filters, page, limit: 8 } });
      setGoals(data.data);
      setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchGoals(1); }, [fetchGoals]);

  useEffect(() => {
    api.get('/users/my-team')
      .then((res) => setEmployees(res.data))
      .catch(() => toast.error('Failed to load team members'));
  }, []);

  const approveGoal = async (goal) => {
    try {
      await api.put(`/goals/${goal.id}`, { approved: true });
      toast.success('Goal approved');
      fetchGoals(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve goal');
    }
  };

  const deleteGoal = async (goal) => {
    if (!window.confirm(`Delete goal "${goal.title}"?`)) return;
    try {
      await api.delete(`/goals/${goal.id}`);
      toast.success('Goal deleted');
      fetchGoals(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete goal');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Team Goals</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)} disabled={!employees.length}>
          + Assign Goal
        </button>
      </div>

      {error && <ErrorBanner message={error} />}
      {loading ? (
        <Spinner label="Loading team goals..." />
      ) : (
        <GoalTable
          goals={goals}
          showEmployee
          filters={filters}
          onFiltersChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
          pagination={pagination}
          onPageChange={(p) => fetchGoals(p)}
          onRowAction={(g) => (
            <div className="flex items-center gap-2 flex-wrap">
              <button className="btn-secondary !py-1 !px-2 text-xs" onClick={() => setReviewGoal(g)}>
                Review
              </button>
              {g.status === 'Completed' && !g.approved && (
                <button className="btn-primary !py-1 !px-2 text-xs" onClick={() => approveGoal(g)}>
                  Approve
                </button>
              )}
              {g.approved ? <span className="text-xs text-green-600">Approved</span> : null}
              <button className="btn-danger !py-1 !px-2 text-xs" onClick={() => deleteGoal(g)}>
                Delete
              </button>
            </div>
          )}
        />
      )}

      {showCreate && (
        <GoalFormModal
          mode="manager"
          employees={employees}
          onClose={() => setShowCreate(false)}
          onCreated={() => fetchGoals(1)}
        />
      )}
      {reviewGoal && (
        <ReviewFormModal goal={reviewGoal} onClose={() => setReviewGoal(null)} onSaved={() => fetchGoals(pagination.page)} />
      )}
    </div>
  );
}
