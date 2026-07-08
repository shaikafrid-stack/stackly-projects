import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { dashboardService } from '../../services/dashboardService';
import Loading from '../../components/Loading';
import {
  RequestsByStatusChart,
  RequestsByPriorityChart,
  MonthlyTrendsChart,
  AssetCategoryChart,
  EngineerResolutionChart,
} from '../../charts/AnalyticsCharts';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .admin()
      .then((res) => setData(res.data.data))
      .catch(() => toast.error('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading full />;
  if (!data) return null;

  const { summary, requestsByStatus, requestsByPriority, monthlyTrends, assetCategoryDistribution, engineerResolutionCount } =
    data;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-gray-500 text-sm">Operational overview across all assets and service requests</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Assets</p>
          <p className="text-3xl font-bold mt-1">{summary.totalAssets}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Requests</p>
          <p className="text-3xl font-bold mt-1">{summary.totalRequests}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Open Requests</p>
          <p className="text-3xl font-bold mt-1 text-amber-600">{summary.openRequests}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Critical Open</p>
          <p className="text-3xl font-bold mt-1 text-red-600">{summary.criticalRequests}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RequestsByStatusChart data={requestsByStatus} />
        <RequestsByPriorityChart data={requestsByPriority} />
        <MonthlyTrendsChart data={monthlyTrends} />
        <AssetCategoryChart data={assetCategoryDistribution} />
        <div className="lg:col-span-2">
          <EngineerResolutionChart data={engineerResolutionCount} />
        </div>
      </div>
    </div>
  );
}
