import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import { StatusBadge, PriorityBadge } from '../../components/Badges';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const COLORS = ['#2a56f6', '#f59e0b', '#10b981', '#64748b', '#e11d48'];

function StatCard({ label, value }) {
  return (
    <div className="card">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function EmployeeDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get('/dashboard/employee').then(({ data }) => setData(data));
  }, []);
  if (!data) return <Spinner />;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Tickets" value={data.totalTickets} />
        <StatCard label="Open Tickets" value={data.openTickets} />
        <StatCard label="Closed Tickets" value={data.closedTickets} />
      </div>
      <div className="card">
        <h2 className="font-semibold mb-3">Recently Updated Tickets</h2>
        {data.recentlyUpdated.length === 0 ? (
          <p className="text-sm text-slate-500">No tickets yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {data.recentlyUpdated.map((t) => (
              <li key={t.id} className="py-2 flex items-center justify-between">
                <Link to={`/tickets/${t.id}`} className="text-sm font-medium hover:text-brand-600">
                  {t.title}
                </Link>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function SupportDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get('/dashboard/support').then(({ data }) => setData(data));
  }, []);
  if (!data) return <Spinner />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Assigned Tickets" value={data.assignedTickets} />
      <StatCard label="Resolved Tickets" value={data.resolvedTickets} />
      <StatCard label="Pending Tickets" value={data.pendingTickets} />
      <StatCard label="Avg. Resolution Time (hrs)" value={data.avgResolutionTimeHours} />
    </div>
  );
}

function AdminDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get('/dashboard/admin').then(({ data }) => setData(data));
  }, []);
  if (!data) return <Spinner />;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Users" value={data.totalUsers} />
        <StatCard label="Total Tickets" value={data.totalTickets} />
        <StatCard label="Knowledge Base Articles" value={data.totalArticles} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <h2 className="font-semibold mb-3">Tickets by Status</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.ticketsByStatus} dataKey="count" nameKey="status" outerRadius={90} label>
                {data.ticketsByStatus.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-3">Tickets by Priority</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.ticketsByPriority}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2a56f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-3">Monthly Resolution Trend</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data.monthlyResolutionTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="resolvedCount" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">
        {user.role === 'admin' ? 'Analytics Dashboard' : 'Dashboard'}
      </h1>
      {user.role === 'employee' && <EmployeeDashboard />}
      {user.role === 'support_engineer' && <SupportDashboard />}
      {user.role === 'admin' && <AdminDashboard />}
    </Layout>
  );
}
