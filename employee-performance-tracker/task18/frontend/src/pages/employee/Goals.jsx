import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import GoalTable from '../../components/GoalTable';
import GoalFormModal from '../../components/GoalFormModal';
import ReviewFormModal from '../../components/ReviewFormModal';
import Spinner from '../../components/Spinner';
import ErrorBanner from '../../components/ErrorBanner';

export default function EmployeeGoals() {
  const [goals, setGoals] = useState([]);
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
      const { data } = await api.get('/goals', {
        params: { ...filters, page, limit: 8 },
      });
      setGoals(data.data);
      setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchGoals(1); }, [fetchGoals]);

  const updateProgress = async (goal, progress) => {
    try {
      await api.put(`/goals/${goal.id}`, {
        progress_percentage: progress,
        status: progress >= 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started',
      });
      toast.success('Progress updated');
      fetchGoals(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update progress');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Goals</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ New Goal</button>
      </div>

      {error && <ErrorBanner message={error} />}
      {loading ? (
        <Spinner label="Loading goals..." />
      ) : (
        <GoalTable
          goals={goals}
          filters={filters}
          onFiltersChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
          pagination={pagination}
          onPageChange={(p) => fetchGoals(p)}
          onRowAction={(g) => (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                defaultValue={g.progress_percentage}
                className="input !py-1 !px-2 w-16"
                onBlur={(e) => {
                  const val = Math.min(100, Math.max(0, Number(e.target.value)));
                  if (val !== g.progress_percentage) updateProgress(g, val);
                }}
              />
              <button className="btn-secondary !py-1 !px-2 text-xs" onClick={() => setReviewGoal(g)}>
                Self Review
              </button>
            </div>
          )}
        />
      )}

      {showCreate && (
        <GoalFormModal mode="employee" onClose={() => setShowCreate(false)} onCreated={() => fetchGoals(1)} />
      )}
      {reviewGoal && (
        <ReviewFormModal goal={reviewGoal} onClose={() => setReviewGoal(null)} onSaved={() => fetchGoals(pagination.page)} />
      )}
    </div>
  );
}
