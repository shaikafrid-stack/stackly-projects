import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCustomerDashboard } from '../../services/api';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { SkeletonCard } from '../../components/common/Skeleton';

export default function CustomerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomerDashboard().then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Tickets', value: data?.total, color: 'text-gray-900' },
    { label: 'Open Tickets', value: data?.open, color: 'text-blue-600' },
    { label: 'Resolved Tickets', value: data?.resolved, color: 'text-green-600' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your support tickets</p>
        </div>
        <Link to="/customer/tickets/new" className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition">+ New Ticket</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {loading ? [1,2,3].map(i => <SkeletonCard key={i} />) : stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-3xl font-bold mt-2 ${s.color}`}>{s.value ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Tickets</h2>
          <Link to="/customer/tickets" className="text-sm text-primary-600 hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? <div className="p-5 text-sm text-gray-400">Loading...</div> :
            data?.recentTickets?.length === 0 ? <div className="p-8 text-center text-sm text-gray-400">No tickets yet. Create your first one!</div> :
            data?.recentTickets?.map(t => (
              <Link to={`/tickets/${t.id}`} key={t.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition">
                <div>
                  <p className="font-medium text-gray-900">{t.ticket_title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.category} · {new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
