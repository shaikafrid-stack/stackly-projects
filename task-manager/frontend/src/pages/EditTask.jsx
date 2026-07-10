import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TaskForm from '../components/TaskForm';
import Loader from '../components/Loader';
import api from '../api/axios';

export default function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const { data } = await api.get(`/tasks/${id}`);
        setTask(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load task.');
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleUpdate = async (values) => {
    setError('');
    setSubmitting(true);
    try {
      await api.put(`/tasks/${id}`, values);
      navigate('/tasks');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Task</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <Loader label="Loading task..." />
        ) : task ? (
          <div className="card">
            <TaskForm
              initialValues={task}
              onSubmit={handleUpdate}
              submitLabel="Save Changes"
              submitting={submitting}
            />
          </div>
        ) : (
          !error && <p className="text-gray-500">Task not found.</p>
        )}
      </main>
    </div>
  );
}
