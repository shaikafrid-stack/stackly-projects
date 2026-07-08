import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { dashboardService } from '../../services/dashboardService';
import Loading from '../../components/Loading';
import { StatusBadge, PriorityBadge } from '../../components/Badges';

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .employee()
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
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <p className="text-gray-500 text-sm">Overview of your assets and service requests</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">My Assets</p>
          <p className="text-3xl font-bold mt-1">{summary.myAssetsCount}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Open Requests</p>
          <p className="text-3xl font-bold mt-1 text-amber-600">{summary.myOpenRequests}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Resolved Requests</p>
          <p className="text-3xl font-bold mt-1 text-green-600">{summary.myResolvedRequests}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Link to="/employee/new-request" className="btn-primary">
          + Raise Service Request
        </Link>
        <Link to="/employee/requests" className="btn-secondary">
          View All My Requests
        </Link>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">Recent Requests</h3>
        {recentRequests.length === 0 ? (
          <p className="text-sm text-gray-400">No service requests yet.</p>
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
