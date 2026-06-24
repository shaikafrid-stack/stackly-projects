import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import { StatCard, PageHeader, LoadingSpinner } from '../../components/shared/UIComponents';
import { Users, FolderOpen, FileText, Clock, CheckCircle, XCircle, UserCheck, Briefcase } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#f59e0b', '#10b981', '#ef4444'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.admin().then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="System-wide overview and analytics" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Users" value={data?.totalUsers} icon={Users} color="blue" />
        <StatCard title="Total Projects" value={data?.totalProjects} icon={FolderOpen} color="purple" />
        <StatCard title="Leave Requests" value={data?.totalLeaveRequests} icon={FileText} color="indigo" />
        <StatCard title="Pending Leaves" value={data?.pendingLeaves} icon={Clock} color="yellow" />
        <StatCard title="Approved Leaves" value={data?.approvedLeaves} icon={CheckCircle} color="green" />
        <StatCard title="Rejected Leaves" value={data?.rejectedLeaves} icon={XCircle} color="red" />
        <StatCard title="Active Projects" value={data?.activeProjects} icon={Briefcase} color="blue" />
        <StatCard title="Employees" value={data?.employees} icon={UserCheck} color="green" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Monthly Leave Trends ({new Date().getFullYear()})</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.monthlyTrends || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Leaves" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Leave Requests by Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data?.leaveByStatus || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {(data?.leaveByStatus || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
