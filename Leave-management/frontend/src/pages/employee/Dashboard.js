import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatCard, PageHeader, StatusBadge, LoadingSpinner } from '../../components/shared/UIComponents';
import { FileText, CheckCircle, Clock, FolderOpen } from 'lucide-react';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.employee().then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title={`Welcome, ${user?.name}!`} subtitle="Here's your overview for today" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Leaves" value={data?.totalLeaves} icon={FileText} color="blue" />
        <StatCard title="Approved" value={data?.approvedLeaves} icon={CheckCircle} color="green" />
        <StatCard title="Pending" value={data?.pendingLeaves} icon={Clock} color="yellow" />
        <StatCard title="Projects" value={data?.assignedProjects} icon={FolderOpen} color="purple" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Recent Leave Requests</h2>
        {data?.recentLeaves?.length === 0 ? (
          <p className="text-gray-400 text-sm">No leave requests yet</p>
        ) : (
          <div className="space-y-3">
            {data?.recentLeaves?.map(lr => (
              <div key={lr.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">{lr.leaveType?.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-500">{lr.startDate} → {lr.endDate}</p>
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
