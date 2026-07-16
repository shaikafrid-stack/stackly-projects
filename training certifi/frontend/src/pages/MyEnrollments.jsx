import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { Badge, Spinner, EmptyState } from '../components/UI';

const MyEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/enrollments', { params: { limit: 50 } });
        setEnrollments(data.data);
      } catch (err) {
        toast.error('Failed to load your enrollments');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">My Enrollments</h1>

        {loading ? (
          <Spinner />
        ) : enrollments.length === 0 ? (
          <EmptyState message="You haven't enrolled in any trainings yet." />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {enrollments.map((e) => (
              <div key={e.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">{e.training?.title}</h3>
                  <Badge status={e.completion_status} />
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${e.progress_percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{e.progress_percentage}% complete</p>
                </div>
                <p className="text-xs text-gray-400 mt-3">Enrolled on {e.enrollment_date}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEnrollments;
