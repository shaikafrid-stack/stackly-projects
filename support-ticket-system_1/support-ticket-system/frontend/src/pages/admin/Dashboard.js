import React, { useEffect, useState } from 'react';
import { getAdminDashboard } from '../../services/api';
import { SkeletonCard } from '../../components/common/Skeleton';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getAdminDashboard().then(res => setData(res.data)).finally(() => setLoading(false)); }, []);

  const stats = [
    { label: 'Total Tickets', value: data?.totalTickets, color: 'text-gray-900' },
    { label: 'Open Tickets', value: data?.openTickets, color: 'text-blue-600' },
    { label: 'Resolved', value: data?.resolvedTickets, color: 'text-green-600' },
    { label: 'Active Agents', value: data?.agents, color: 'text-gray-900' },
    { label: 'SLA Breaches', value: data?.slaBreaches, color: 'text-red-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Overview of the entire support system</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {loading ? [1,2,3,4,5].map(i => <SkeletonCard key={i} />) : stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-3xl font-bold mt-2 ${s.color}`}>{s.value ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? <div className="p-5 text-sm text-gray-400">Loading...</div> :
            data?.recentActivity?.length === 0 ? <div className="p-8 text-center text-sm text-gray-400">No activity yet.</div> :
            data?.recentActivity?.map(a => (
              <div key={a.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm text-gray-900"><span className="font-medium">{a.User?.name}</span> {a.activity}</p>
                  <p className="text-xs text-gray-400">{a.module_name}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleString()}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
