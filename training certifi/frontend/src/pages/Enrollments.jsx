import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { Badge, Spinner, EmptyState } from '../components/UI';

const Enrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/enrollments', { params: { status: statusFilter || undefined, limit: 50 } });
      setEnrollments(data.data);
    } catch (err) {
      toast.error('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const updateEnrollment = async (id, fields) => {
    try {
      await api.put(`/enrollments/${id}`, fields);
      toast.success('Enrollment updated');
      fetchEnrollments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const issueCertificate = async (enrollment) => {
    try {
      await api.post('/certifications', {
        employee_id: enrollment.employee_id,
        training_id: enrollment.training_id,
      });
      toast.success('Certificate issued!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not issue certificate');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Enrollments</h1>
          <select
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {loading ? (
          <Spinner />
        ) : enrollments.length === 0 ? (
          <EmptyState message="No enrollments found." />
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-700">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Training</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e.id} className="border-b border-gray-50 dark:border-gray-700/50">
                    <td className="py-3 px-4">{e.employee?.name}</td>
                    <td className="py-3 px-4">{e.training?.title}</td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        defaultValue={e.progress_percentage}
                        onBlur={(ev) => updateEnrollment(e.id, { progress_percentage: Number(ev.target.value) })}
                        className="w-16 rounded border border-gray-300 dark:border-gray-600 bg-transparent px-2 py-1 text-xs"
                      />%
                    </td>
                    <td className="py-3 px-4">
                      <select
                        defaultValue={e.attendance}
                        onChange={(ev) => updateEnrollment(e.id, { attendance: ev.target.value })}
                        className="rounded border border-gray-300 dark:border-gray-600 bg-transparent px-2 py-1 text-xs"
                      >
                        <option value="not_marked">Not marked</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        defaultValue={e.completion_status}
                        onChange={(ev) => updateEnrollment(e.id, { completion_status: ev.target.value })}
                        className="rounded border border-gray-300 dark:border-gray-600 bg-transparent px-2 py-1 text-xs"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        disabled={e.completion_status !== 'completed'}
                        onClick={() => issueCertificate(e)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Issue Certificate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Enrollments;
