import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { dashboardService } from '../../services/dashboardService';
import Loading from '../../components/Loading';
import { StatusBadge, PriorityBadge } from '../../components/Badges';

export default function EngineerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .maintenance()
      .then((res) => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading full />;
  if (!data) return null;

  const { summary, recentRequests } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Maintenance Dashboard</h1>
        <p className="text-gray-500 text-sm">Your assigned service requests at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Assigned</p>
          <p className="text-3xl font-bold mt-1 text-purple-600">{summary.assignedCount}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-3xl font-bold mt-1 text-amber-600">{summary.inProgressCount}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Resolved</p>
          <p className="text-3xl font-bold mt-1 text-green-600">{summary.resolvedCount}</p>
        </div>
      </div>

      <Link to="/engineer/requests" className="btn-primary inline-flex">
        View Assigned Requests
      </Link>

      <div className="card">
        <h3 className="font-semibold mb-4">Recent Activity</h3>
        {recentRequests.length === 0 ? (
          <p className="text-sm text-gray-400">No assigned requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="py-2 pr-4">Issue</th>
                  <th className="py-2 pr-4">Asset</th>
                  <th className="py-2 pr-4">Priority</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100">
                    <td className="py-2 pr-4">{r.issue_title}</td>
                    <td className="py-2 pr-4">{r.asset_name}</td>
                    <td className="py-2 pr-4">
                      <PriorityBadge priority={r.priority} />
                    </td>
                    <td className="py-2 pr-4">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
