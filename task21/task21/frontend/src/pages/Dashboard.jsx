import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from "recharts";
import { Database, PlugZap, PlugZap as PlugOff, CheckCircle2, XCircle, Clock } from "lucide-react";
import AppLayout from "../components/AppLayout";
import SummaryCard from "../components/SummaryCard";
import { InlineLoading } from "../components/LoadingScreen";
import { useAuth } from "../context/AuthContext";
import { getAdminDashboard, getAnalystDashboard } from "../api/dataSources";
import { ResultPill } from "../components/Badges";

const PIE_COLORS = ["#14B8A6", "#5B5FEF", "#F79009", "#F04438", "#12B76A", "#00758F", "#8C4FFF", "#29B5E8"];

export default function Dashboard() {
  const { isAdmin, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetcher = isAdmin ? getAdminDashboard : getAnalystDashboard;
    fetcher()
      .then(({ data }) => setData(data.data))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  return (
    <AppLayout
      title={`Welcome back, ${user?.name?.split(" ")[0]}`}
      subtitle={isAdmin ? "Overview of all registered data sources and connection health." : "Read-only overview of data source availability and activity."}
    >
      {loading || !data ? (
        <InlineLoading label="Loading dashboard…" />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <SummaryCard label="Total Data Sources" value={data.cards.totalDataSources} icon={Database} tint="indigo" />
            <SummaryCard label="Active Connections" value={data.cards.activeConnections} icon={PlugZap} tint="success" />
            <SummaryCard label="Inactive Connections" value={data.cards.inactiveConnections} icon={PlugOff} tint="accent" />
            <SummaryCard label="Successful Tests" value={data.cards.successfulTests} icon={CheckCircle2} tint="success" />
            <SummaryCard label="Failed Tests" value={data.cards.failedTests} icon={XCircle} tint="danger" />
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="bg-white border border-line rounded-xl2 shadow-card p-5">
              <p className="text-sm font-semibold text-ink-900 mb-1">Data Sources by Database Type</p>
              <p className="text-xs text-ink-600 mb-3">Distribution across supported engines</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data.charts.byDatabaseType} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {data.charts.byDatabaseType.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-line rounded-xl2 shadow-card p-5">
              <p className="text-sm font-semibold text-ink-900 mb-1">Active vs Inactive</p>
              <p className="text-xs text-ink-600 mb-3">Current connection status split</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data.charts.activeVsInactive} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    <Cell fill="#12B76A" />
                    <Cell fill="#E4E7EE" />
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-line rounded-xl2 shadow-card p-5">
              <p className="text-sm font-semibold text-ink-900 mb-1">Data Sources by Environment</p>
              <p className="text-xs text-ink-600 mb-3">Development, Testing, Production</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.charts.byEnvironment}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDEFF4" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#5B5FEF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white border border-line rounded-xl2 shadow-card p-5">
              <p className="text-sm font-semibold text-ink-900 mb-1">Monthly Connection Test History</p>
              <p className="text-xs text-ink-600 mb-3">Successful vs failed tests over time</p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data.charts.monthlyHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDEFF4" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="success" name="Success" stroke="#12B76A" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="failed" name="Failed" stroke="#F04438" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-line rounded-xl2 shadow-card p-5">
              <p className="text-sm font-semibold text-ink-900 mb-3">Recent Activity</p>
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                {data.recentActivity.length === 0 && (
                  <p className="text-sm text-ink-600">No connection tests yet.</p>
                )}
                {data.recentActivity.map((a) => (
                  <div key={a.id} className="flex items-start justify-between gap-2 pb-3 border-b border-line-soft last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-900 truncate">{a.connection_name}</p>
                      <p className="text-[11px] text-ink-600 flex items-center gap-1 mt-0.5">
                        <Clock size={11} /> {new Date(a.test_time).toLocaleString()}
                        {a.tested_by_name && ` · ${a.tested_by_name}`}
                      </p>
                    </div>
                    <ResultPill result={a.connection_status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
