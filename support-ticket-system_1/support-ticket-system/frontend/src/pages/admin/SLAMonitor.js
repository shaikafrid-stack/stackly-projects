import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSLA } from '../../services/api';
import { SkeletonRow } from '../../components/common/Skeleton';

export default function SLAMonitor() {
  const [slaRecords, setSlaRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getSLA().then(res => setSlaRecords(res.data.sla)).finally(() => setLoading(false));
  }, []);

  const filtered = slaRecords.filter(s => {
    if (filter === 'breached') return s.breached_status;
    if (filter === 'safe') return !s.breached_status;
    return true;
  });

  const breachedCount = slaRecords.filter(s => s.breached_status).length;
  const breachPercent = slaRecords.length ? ((breachedCount / slaRecords.length) * 100).toFixed(1) : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">SLA Monitoring</h1>
      <p className="text-sm text-gray-500 mb-6">Track response and resolution deadlines across all tickets</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total SLA Records</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{slaRecords.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">SLA Breaches</p>
          <p className="text-3xl font-bold mt-2 text-red-600">{breachedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Breach Rate</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{breachPercent}%</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {['all', 'breached', 'safe'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${filter === f ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Ticket</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium">Response Deadline</th>
              <th className="px-4 py-3 font-medium">Resolution Deadline</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? [1,2,3,4].map(i => <SkeletonRow key={i} />) :
              filtered.length === 0 ? <tr><td colSpan={6} className="text-center py-10 text-gray-400">No SLA records found.</td></tr> :
              filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><Link to={`/tickets/${s.Ticket?.id}`} className="font-medium text-gray-900 hover:text-primary-600">{s.Ticket?.ticket_title}</Link></td>
                  <td className="px-4 py-3 text-gray-600">{s.Ticket?.customer?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.Ticket?.agent?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(s.response_deadline).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(s.resolution_deadline).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.breached_status ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {s.breached_status ? 'Breached' : 'On Track'}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
