import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import { Users, UserX, Clock, FileText } from 'lucide-react';

export default function ManagerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/manager')
      .then((res) => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manager Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Team Size" value={data.team_size} icon={Users} accent="primary" />
        <StatCard label="Absent Today" value={data.employees_absent_today} icon={UserX} accent="red" />
        <StatCard label="Late Check-Ins Today" value={data.late_check_ins_today.length} icon={Clock} accent="amber" />
        <StatCard label="Pending Approvals" value={data.pending_approval_requests} icon={FileText} accent="green" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold">Team Attendance Summary (last 30 days)</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-left text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3">Employee</th>
              <th className="px-6 py-3">Present</th>
              <th className="px-6 py-3">Absent</th>
              <th className="px-6 py-3">Half Day</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.team_attendance_summary.map((row) => (
              <tr key={row.id}>
                <td className="px-6 py-3">
                  <p className="font-medium">{row.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{row.email}</p>
                </td>
                <td className="px-6 py-3">{row.present_days || 0}</td>
                <td className="px-6 py-3">{row.absent_days || 0}</td>
                <td className="px-6 py-3">{row.half_days || 0}</td>
              </tr>
            ))}
            {data.team_attendance_summary.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-center text-gray-500">
                  No team members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
