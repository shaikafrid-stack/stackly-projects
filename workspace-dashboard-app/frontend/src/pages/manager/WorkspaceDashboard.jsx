import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Briefcase, LayoutGrid, Users } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import StatCard from '../../components/StatCard.jsx';
import api from '../../api/axios.js';

export default function WorkspaceDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/dashboard/manager');
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Layout><Loader /></Layout>;
  if (!data) return <Layout><p className="text-gray-500">No data available.</p></Layout>;

  const { summary, recentDashboards, charts } = data;

  return (
    <Layout>
      <h2 className="text-xl font-bold mb-5">Workspace Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Workspaces Managed" value={summary.totalWorkspaces} icon={Briefcase} accent="primary" />
        <StatCard label="Total Dashboards" value={summary.totalDashboards} icon={LayoutGrid} accent="amber" />
        <StatCard label="Total Members" value={summary.totalMembers} icon={Users} accent="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <h3 className="font-semibold mb-4">Dashboards by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts.dashboardsByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Recently Created Dashboards</h3>
          <ul className="divide-y divide-gray-100">
            {recentDashboards.map((d) => (
              <li key={d.id} className="py-2.5 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{d.dashboard_name}</p>
                  <p className="text-xs text-gray-500">{d.workspace_name} &middot; {d.category}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(d.created_at).toLocaleDateString()}</span>
              </li>
            ))}
            {recentDashboards.length === 0 && <p className="text-gray-400 text-sm py-4">No dashboards yet.</p>}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
