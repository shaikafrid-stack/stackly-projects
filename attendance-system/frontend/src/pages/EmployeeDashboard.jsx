import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Loading from '../components/Loading';
import { Clock, TrendingUp, CalendarCheck, FileText, LogIn, LogOut } from 'lucide-react';

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get('/dashboard/employee');
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await api.post('/attendance/checkin');
      toast.success('Checked in successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await api.put('/attendance/checkout');
      toast.success('Checked out successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!data) return null;

  const today = data.todays_attendance;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Employee Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Hours (Month)" value={`${data.total_working_hours_month} hrs`} icon={Clock} accent="primary" />
        <StatCard label="Attendance %" value={`${data.attendance_percentage}%`} icon={TrendingUp} accent="green" />
        <StatCard label="Today's Status" value={today?.status || 'Not marked'} icon={CalendarCheck} accent="amber" />
        <StatCard label="Pending Requests" value={data.pending_regularization_requests} icon={FileText} accent="red" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="font-semibold mb-4">Today's Attendance</h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-gray-500 dark:text-gray-400">Check-In: </span>
              {today?.check_in ? new Date(today.check_in).toLocaleTimeString() : '—'}
            </p>
            <p>
              <span className="text-gray-500 dark:text-gray-400">Check-Out: </span>
              {today?.check_out ? new Date(today.check_out).toLocaleTimeString() : '—'}
            </p>
            <p>
              <span className="text-gray-500 dark:text-gray-400">Status: </span>
              {today?.status ? <Badge status={today.status} /> : '—'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCheckIn}
              disabled={actionLoading || (today && today.check_in)}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              <LogIn size={16} /> Check In
            </button>
            <button
              onClick={handleCheckOut}
              disabled={actionLoading || !today?.check_in || today?.check_out}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              <LogOut size={16} /> Check Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
