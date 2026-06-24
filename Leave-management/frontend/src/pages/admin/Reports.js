import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import { PageHeader, LoadingSpinner } from '../../components/shared/UIComponents';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from 'recharts';

const COLORS = ['#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6'];

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.admin().then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const userDistribution = [
    { name: 'Employees', value: data?.employees || 0 },
    { name: 'Managers', value: data?.managers || 0 },
    { name: 'Admins', value: Number(data?.totalUsers || 0) - (data?.employees || 0) - (data?.managers || 0) },
  ];

  return (
    <div>
      <PageHeader title="Reports & Analytics" subtitle="System-wide analytics and trends" />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Monthly Leave Trends</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data?.monthlyTrends || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Leaves" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Leave Requests by Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data?.leaveByStatus || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {(data?.leaveByStatus || []).map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Department-wise Employee Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={userDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Count">
                {userDistribution.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Key Metrics Summary</h2>
          <div className="space-y-4">
            {[
              { label: 'Total Users', value: data?.totalUsers, color: 'bg-blue-500' },
              { label: 'Total Projects', value: data?.totalProjects, color: 'bg-purple-500' },
              { label: 'Total Leave Requests', value: data?.totalLeaveRequests, color: 'bg-indigo-500' },
              { label: 'Approval Rate', value: data?.totalLeaveRequests > 0 ? `${Math.round((data?.approvedLeaves / data?.totalLeaveRequests) * 100)}%` : '0%', color: 'bg-green-500' },
            ].map(m => (
              <div key={m.label} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${m.color}`}></div>
                <span className="text-sm text-gray-600 flex-1">{m.label}</span>
                <span className="text-sm font-bold text-gray-800">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
