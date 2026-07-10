import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, ArrowUpDown } from 'lucide-react';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import Loader from '../components/Loader';
import api from '../api/axios';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [order, setOrder] = useState('asc');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/tasks', {
        params: {
          search: search || undefined,
          status: status || undefined,
          priority: priority || undefined,
          sortBy: 'due_date',
          order,
        },
      });
      setTasks(data.tasks);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [search, status, priority, order]);

  useEffect(() => {
    const timeout = setTimeout(fetchTasks, 300); // debounce search
    return () => clearTimeout(timeout);
  }, [fetchTasks]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/tasks/${id}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
          <Link to="/tasks/new" className="btn-primary flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> New Task
          </Link>
        </div>

        <div className="card mb-6 flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>

          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field md:w-44">
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input-field md:w-44">
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <button
            onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
            className="btn-secondary flex items-center gap-2 justify-center md:w-44"
            title="Sort by due date"
          >
            <ArrowUpDown className="h-4 w-4" />
            Due Date: {order === 'asc' ? 'Earliest' : 'Latest'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <Loader label="Loading tasks..." />
        ) : tasks.length === 0 ? (
          <div className="card text-center py-10 text-gray-500">
            No tasks match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
