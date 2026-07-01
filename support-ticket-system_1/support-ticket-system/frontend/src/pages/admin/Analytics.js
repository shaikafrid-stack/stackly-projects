import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getAdminDashboard, getSLA, getTickets } from '../../services/api';

const STATUS_COLORS = { open: '#3b82f6', in_progress: '#f59e0b', on_hold: '#6b7280', resolved: '#10b981', closed: '#9ca3af' };
const PRIORITY_COLORS = { low: '#9ca3af', medium: '#3b82f6', high: '#f97316', critical: '#ef4444' };

export default function Analytics() {
  const [dash, setDash] = useState(null);
  const [sla, setSla] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminDashboard(), getSLA(), getTickets({ limit: 1000 })])
      .then(([d, s, t]) => {
        setDash(d.data);
        setSla(s.data.sla);

        // Build monthly trend from tickets
        const counts = {};
        t.data.tickets.forEach(tk => {
          const month = new Date(tk.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
          counts[month] = (counts[month] || 0) + 1;
        });
        const trend = Object.entries(counts).map(([month, count]) => ({ month, count }));
        setMonthlyTrend(trend);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading analytics...</div>;

  const statusData = (dash?.ticketsByStatus || []).map(s => ({ name: s.status.replace('_',' '), value: parseInt(s.count) }));
  const priorityData = (dash?.ticketsByPriority || []).map(p => ({ name: p.priority, value: parseInt(p.count) }));
  const agentData = (dash?.agentStats || []).map(a => ({ name: a['agent.name'] || 'Unknown', resolved: parseInt(a.count) }));
  const breached = sla.filter(s => s.breached_status).length;
  const slaPieData = [
    { name: 'On Track', value: sla.length - breached },
    { name: 'Breached', value: breached },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Support Analytics</h1>
      <p className="text-sm text-gray-500 mb-6">Visual insights into ticket trends and performance</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Tickets by Status</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {statusData.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.name.replace(' ','_')] || '#3b82f6'} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Tickets by Priority</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[4,4,0,0]}>
                {priorityData.map((entry, i) => <Cell key={i} fill={PRIORITY_COLORS[entry.name] || '#3b82f6'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">SLA Breach Percentage</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={slaPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Agent-wise Resolution Count</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={agentData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="resolved" fill="#2563eb" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 lg:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-4">Monthly Ticket Trends</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
