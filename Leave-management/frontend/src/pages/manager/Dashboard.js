import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import { StatCard, PageHeader, StatusBadge, LoadingSpinner } from '../../components/shared/UIComponents';
import { Users, FolderOpen, Clock, Link } from 'lucide-react';

export default function ManagerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.manager().then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Manager Dashboard" subtitle="Team overview and pending actions" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Employees" value={data?.totalEmployees} icon={Users} color="blue" />
        <StatCard title="Active Projects" value={data?.activeProjects} icon={FolderOpen} color="green" />
        <StatCard title="Pending Approvals" value={data?.pendingLeaves} icon={Clock} color="yellow" />
        <StatCard title="Assignments" value={data?.totalAssignments} icon={Link} color="purple" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Pending Leave Requests</h2>
        {!data?.recentLeaves?.length ? (
          <p className="text-gray-400 text-sm">No pending requests</p>
        ) : (
          <div className="space-y-3">
            {data.recentLeaves.map(lr => (
              <div key={lr.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <div>
                  <p className="text-sm font-medium text-gray-800">{lr.employeeName}</p>
                  <p className="text-xs text-gray-500">{lr.leaveType} · {lr.startDate} → {lr.endDate}</p>
                </div>
                <StatusBadge status={lr.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
