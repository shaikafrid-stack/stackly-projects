import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import Spinner from '../../components/Spinner';
import ErrorBanner from '../../components/ErrorBanner';

export default function ManagerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    api.get('/dashboard/manager')
      .then((res) => mounted && setData(res.data))
      .catch((err) => mounted && setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) return <Spinner label="Loading dashboard..." />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manager Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Team Goals" value={data.team_goals} />
        <StatCard label="Pending Review" value={data.goals_pending_review} accent="amber" />
        <StatCard label="Completed Goals" value={data.completed_goals} accent="green" />
      </div>

      <div className="card overflow-x-auto">
        <h2 className="font-semibold mb-3">Team Performance Summary</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
              <th className="py-2 pr-4">Employee</th>
              <th className="py-2 pr-4">Total Goals</th>
              <th className="py-2 pr-4">Completed</th>
              <th className="py-2 pr-4">Avg. Progress</th>
            </tr>
          </thead>
          <tbody>
            {data.team_performance_summary.map((row) => (
              <tr key={row.employee_id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4">{row.employee_name}</td>
                <td className="py-2 pr-4">{row.total_goals || 0}</td>
                <td className="py-2 pr-4">{row.completed_goals || 0}</td>
                <td className="py-2 pr-4">{row.avg_progress ?? 0}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
