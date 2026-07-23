import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Badge from '../components/Badge';
import Pagination from '../components/Pagination';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';
import { Download, X } from 'lucide-react';

export default function Attendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ start_date: '', end_date: '', status: '' });
  const [regModal, setRegModal] = useState(null); // attendance record for which to file regularization
  const [reason, setReason] = useState('');
  const limit = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await api.get('/attendance', { params });
      setRecords(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      toast.error('Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (key, value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const exportCSV = () => {
    const headers = ['Date', 'Employee', 'Check-In', 'Check-Out', 'Total Hours', 'Status'];
    const rows = records.map((r) => [
      r.attendance_date,
      r.employee_name,
      r.check_in || '',
      r.check_out || '',
      r.total_hours || '',
      r.status,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const submitRegularization = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason.');
      return;
    }
    try {
      await api.post('/regularization', { attendance_id: regModal.id, reason });
      toast.success('Regularization request submitted.');
      setRegModal(null);
      setReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{user?.role === 'employee' ? 'My Attendance' : 'Attendance Records'}</h1>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-wrap gap-3">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400">Start Date</label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => handleFilterChange('start_date', e.target.value)}
            className="block px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400">End Date</label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => handleFilterChange('end_date', e.target.value)}
            className="block px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="block px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm"
          >
            <option value="">All</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Half Day">Half Day</option>
            <option value="Late">Late</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <Loading />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-left text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Date</th>
                {user?.role !== 'employee' && <th className="px-6 py-3">Employee</th>}
                <th className="px-6 py-3">Check-In</th>
                <th className="px-6 py-3">Check-Out</th>
                <th className="px-6 py-3">Total Hours</th>
                <th className="px-6 py-3">Status</th>
                {user?.role === 'employee' && <th className="px-6 py-3">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-3">{r.attendance_date}</td>
                  {user?.role !== 'employee' && <td className="px-6 py-3">{r.employee_name}</td>}
                  <td className="px-6 py-3">{r.check_in ? new Date(r.check_in).toLocaleTimeString() : '—'}</td>
                  <td className="px-6 py-3">{r.check_out ? new Date(r.check_out).toLocaleTimeString() : '—'}</td>
                  <td className="px-6 py-3">{r.total_hours ?? '—'}</td>
                  <td className="px-6 py-3">
                    <Badge status={r.status} />
                  </td>
                  {user?.role === 'employee' && (
                    <td className="px-6 py-3">
                      <button
                        onClick={() => setRegModal(r)}
                        className="text-primary-600 hover:underline text-xs font-medium"
                      >
                        Request Regularization
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        <div className="px-6 pb-4">
          <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
        </div>
      </div>

      {regModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Request Regularization</h3>
              <button onClick={() => setRegModal(null)}>
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              For attendance on <strong>{regModal.attendance_date}</strong> (currently {regModal.status})
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Explain the reason for regularization..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setRegModal(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={submitRegularization}
                className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
