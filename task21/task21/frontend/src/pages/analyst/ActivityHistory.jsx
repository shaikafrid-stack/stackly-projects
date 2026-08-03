import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Activity } from "lucide-react";
import AppLayout from "../../components/AppLayout";
import { ResultPill } from "../../components/Badges";
import { InlineLoading } from "../../components/LoadingScreen";
import EmptyState from "../../components/EmptyState";
import { getAnalystDashboard } from "../../api/dataSources";

export default function ActivityHistory() {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalystDashboard()
      .then(({ data }) => setActivity(data.data.recentActivity))
      .catch(() => toast.error("Failed to load activity history."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout title="Activity History" subtitle="Recent connection test activity across all data sources.">
      <div className="bg-white border border-line rounded-xl2 shadow-card">
        {loading ? (
          <InlineLoading label="Loading activity…" />
        ) : activity.length === 0 ? (
          <EmptyState icon={Activity} title="No activity yet" message="Connection tests will appear here once administrators run them." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-ink-600 uppercase tracking-wide border-b border-line">
                  <th className="px-4 py-3">Data Source</th>
                  <th className="px-4 py-3">Test Time</th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3">Tested By</th>
                  <th className="px-4 py-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {activity.map((a) => (
                  <tr key={a.id} className="hover:bg-surface-muted/60">
                    <td className="px-4 py-3 font-semibold text-ink-900">{a.connection_name}</td>
                    <td className="px-4 py-3 text-xs font-mono-data text-ink-600">
                      {new Date(a.test_time).toLocaleString()}
                    </td>
                    <td className="px-4 py-3"><ResultPill result={a.connection_status} /></td>
                    <td className="px-4 py-3 text-ink-900">{a.tested_by_name || "System"}</td>
                    <td className="px-4 py-3 text-ink-600">{a.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
