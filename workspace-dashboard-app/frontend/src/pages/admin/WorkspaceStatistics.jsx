import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Briefcase, CheckCircle2, LayoutGrid, Users } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import StatCard from '../../components/StatCard.jsx';
import api from '../../api/axios.js';

const COLORS = ['#4f46e5', '#22c55e', '#f59e0b', '#ef4444', '#0ea5e9', '#a855f7'];

export default function WorkspaceStatistics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/dashboard/admin');
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load statistics.');
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
      <h2 className="text-xl font-bold mb-5">Workspace Statistics</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Workspaces" value={summary.totalWorkspaces} icon={Briefcase} accent="primary" />
        <StatCard label="Active Workspaces" value={summary.activeWorkspaces} icon={CheckCircle2} accent="green" />
        <StatCard label="Total Dashboards" value={summary.totalDashboards} icon={LayoutGrid} accent="amber" />
        <StatCard label="Total Members" value={summary.totalMembers} icon={Users} accent="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Workspaces by Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={charts.workspacesByStatus} dataKey="value" nameKey="name" outerRadius={90} label>
                {charts.workspacesByStatus.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

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
          <h3 className="font-semibold mb-4">Monthly Workspace Growth</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={charts.monthlyGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">User Distribution per Workspace</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts.userDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#f59e0b" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">Recently Created Dashboards</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="pb-2 pr-4">Dashboard</th>
              <th className="pb-2 pr-4">Workspace</th>
              <th className="pb-2 pr-4">Category</th>
              <th className="pb-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {recentDashboards.map((d) => (
              <tr key={d.id} className="border-b border-gray-100 last:border-0">
                <td className="py-2.5 pr-4 font-medium">{d.dashboard_name}</td>
                <td className="py-2.5 pr-4">{d.workspace_name}</td>
                <td className="py-2.5 pr-4">{d.category}</td>
                <td className="py-2.5 text-gray-500">{new Date(d.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {recentDashboards.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-400">
                  No dashboards yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
