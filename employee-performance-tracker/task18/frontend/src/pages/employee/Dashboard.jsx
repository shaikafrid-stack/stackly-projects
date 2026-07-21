import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import Spinner from '../../components/Spinner';
import ErrorBanner from '../../components/ErrorBanner';
import Badge from '../../components/Badge';

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get('/dashboard/employee')
      .then((res) => mounted && setData(res.data))
      .catch((err) => mounted && setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) return <Spinner label="Loading dashboard..." />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Goals" value={data.total_goals} />
        <StatCard label="Completed Goals" value={data.completed_goals} accent="green" />
        <StatCard label="Pending Goals" value={data.pending_goals} accent="amber" />
        <StatCard label="Avg. Rating" value={data.average_rating ?? '—'} accent="brand" />
      </div>

      <div className="card">
        <h2 className="font-semibold mb-3">Upcoming Goals</h2>
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {data.recent_goals.length === 0 && <p className="text-gray-400 text-sm py-4">No goals yet.</p>}
          {data.recent_goals.map((g) => (
            <li key={g.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{g.title}</p>
                <p className="text-xs text-gray-500">Due {g.target_date}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{g.priority}</Badge>
                <Badge>{g.status}</Badge>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
