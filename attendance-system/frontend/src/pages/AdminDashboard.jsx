import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import { Users, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/admin')
      .then((res) => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (!data) return null;

  const trends = data.monthly_attendance_trends.map((t) => ({
    date: new Date(t.attendance_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Present: t.present_count,
    Absent: t.absent_count,
    'Half Day': t.half_day_count,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Employees" value={data.total_employees} icon={Users} accent="primary" />
        <StatCard label="Attendance % Today" value={`${data.attendance_percentage_today}%`} icon={TrendingUp} accent="green" />
        <StatCard label="Shifts Configured" value={data.shift_utilization.length} icon={Clock} accent="amber" />
        <StatCard label="Records (This Month)" value={data.monthly_attendance_trends.length} icon={BarChart3} accent="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold mb-4">Monthly Attendance Trends</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Present" stroke="#4f46e5" strokeWidth={2} />
              <Line type="monotone" dataKey="Absent" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="Half Day" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold mb-4">Shift Utilization</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.shift_utilization}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="shift_name" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="employees_assigned" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
