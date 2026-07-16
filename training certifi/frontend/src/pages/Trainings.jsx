import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { Badge, Spinner, EmptyState } from '../components/UI';
import TrainingFormModal from '../components/TrainingFormModal';

const Trainings = () => {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('start_date');
  const [order, setOrder] = useState('ASC');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [myEnrollments, setMyEnrollments] = useState([]);

  const canManage = user.role === 'trainer' || user.role === 'admin';

  const fetchTrainings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/trainings', {
        params: { search, status, sortBy, order, page, limit: 8 },
      });
      setTrainings(data.data);
      setTotalPages(data.pagination.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load trainings');
    } finally {
      setLoading(false);
    }
  }, [search, status, sortBy, order, page]);

  const fetchMyEnrollments = useCallback(async () => {
    if (user.role !== 'employee') return;
    try {
      const { data } = await api.get('/enrollments');
      setMyEnrollments(data.data.map((e) => e.training_id));
    } catch (err) {
      // silent
    }
  }, [user.role]);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  useEffect(() => {
    fetchMyEnrollments();
  }, [fetchMyEnrollments]);

  const handleEnroll = async (trainingId) => {
    try {
      await api.post('/enrollments', { training_id: trainingId });
      toast.success('Enrolled successfully!');
      fetchMyEnrollments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this training program?')) return;
    try {
      await api.delete(`/trainings/${id}`);
      toast.success('Training deleted');
      fetchTrainings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {user.role === 'employee' ? 'Browse Trainings' : 'Training Programs'}
          </h1>
          {canManage && (
            <button
              onClick={() => { setEditing(null); setShowModal(true); }}
              className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
            >
              + New Training
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <input
            className="flex-1 min-w-[180px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          />
          <select
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            value={status}
            onChange={(e) => { setPage(1); setStatus(e.target.value); }}
          >
            <option value="">All statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="start_date">Sort by start date</option>
            <option value="title">Sort by title</option>
          </select>
          <button
            onClick={() => setOrder(order === 'ASC' ? 'DESC' : 'ASC')}
            className="text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          >
            {order === 'ASC' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>

        {loading ? (
          <Spinner />
        ) : trainings.length === 0 ? (
          <EmptyState message="No training programs found." />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {trainings.map((t) => (
              <div key={t.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">{t.title}</h3>
                  <Badge status={t.status} />
                </div>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{t.description}</p>
                <div className="text-xs text-gray-400 mt-3 space-y-1">
                  <p>Trainer: {t.trainer?.name || '—'}</p>
                  <p>Duration: {t.duration || '—'}</p>
                  <p>{t.start_date} → {t.end_date}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  {user.role === 'employee' && (
                    <button
                      disabled={myEnrollments.includes(t.id)}
                      onClick={() => handleEnroll(t.id)}
                      className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-primary-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {myEnrollments.includes(t.id) ? 'Enrolled' : 'Enroll'}
                    </button>
                  )}
                  {canManage && (
                    <>
                      <button
                        onClick={() => { setEditing(t); setShowModal(true); }}
                        className="text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-sm font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <TrainingFormModal
          training={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchTrainings(); }}
        />
      )}
    </div>
  );
};

export default Trainings;
