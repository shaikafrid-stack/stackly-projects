import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListChecks, Clock, Loader as LoaderIcon, CheckCircle2, PlusCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import TaskCard from '../components/TaskCard';
import Loader from '../components/Loader';
import api from '../api/axios';

export default function Dashboard() {
  const [summary, setSummary] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/tasks', { params: { sortBy: 'created_at', order: 'desc' } });
      setSummary(data.summary);
      setRecentTasks(data.tasks.slice(0, 6));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Here's an overview of your tasks</p>
          </div>
          <Link to="/tasks/new" className="btn-primary flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> New Task
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <Loader label="Loading dashboard..." />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Tasks" value={summary.total} icon={ListChecks} color="bg-brand-600" />
              <StatCard label="Pending" value={summary.pending} icon={Clock} color="bg-gray-500" />
              <StatCard label="In Progress" value={summary.inProgress} icon={LoaderIcon} color="bg-blue-500" />
              <StatCard label="Completed" value={summary.completed} icon={CheckCircle2} color="bg-emerald-500" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
              <Link to="/tasks" className="text-sm text-brand-600 font-medium hover:underline">
                View all
              </Link>
            </div>

            {recentTasks.length === 0 ? (
              <div className="card text-center py-10 text-gray-500">
                No tasks yet. <Link to="/tasks/new" className="text-brand-600 font-medium">Create your first task</Link>.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
