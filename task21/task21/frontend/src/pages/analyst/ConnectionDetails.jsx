import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Server, Hash, Database, User, Clock, Layers } from "lucide-react";
import AppLayout from "../../components/AppLayout";
import Button from "../../components/Button";
import { StatusPill, ResultPill, EnvPill, DbTypeTag } from "../../components/Badges";
import { InlineLoading } from "../../components/LoadingScreen";
import { getDataSource, getHistory } from "../../api/dataSources";

export default function ConnectionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [source, setSource] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDataSource(id), getHistory(id)])
      .then(([srcRes, histRes]) => {
        setSource(srcRes.data.data);
        setHistory(histRes.data.data.slice(0, 8));
      })
      .catch(() => toast.error("Could not load connection details."))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <AppLayout
      title="Connection Details"
      subtitle="Read-only view of this data source configuration."
      actions={
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate("/analyst/data-sources")}>
          Back to list
        </Button>
      }
    >
      {loading ? (
        <InlineLoading label="Loading connection details…" />
      ) : !source ? (
        <p className="text-sm text-ink-600">Data source not found.</p>
      ) : (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white border border-line rounded-xl2 shadow-card p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-ink-900">{source.connection_name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <DbTypeTag type={source.database_type} />
                  <EnvPill env={source.environment} />
                  <StatusPill status={source.status} />
                </div>
              </div>
              <ResultPill result={source.last_result} />
            </div>

            <dl className="grid sm:grid-cols-2 gap-5">
              <DetailItem icon={Server} label="Host" value={source.host} mono />
              <DetailItem icon={Hash} label="Port" value={source.port} mono />
              <DetailItem icon={Database} label="Database Name" value={source.database_name} mono />
              <DetailItem icon={User} label="Username" value={source.username} mono />
              <DetailItem icon={Layers} label="Category" value={source.category} />
              <DetailItem
                icon={Clock}
                label="Last Tested"
                value={source.last_tested_at ? new Date(source.last_tested_at).toLocaleString() : "Not tested yet"}
              />
            </dl>
          </div>

          <div className="bg-white border border-line rounded-xl2 shadow-card p-5">
            <p className="text-sm font-semibold text-ink-900 mb-3">Recent Test Activity</p>
            <div className="space-y-3">
              {history.length === 0 && <p className="text-sm text-ink-600">No connection tests recorded.</p>}
              {history.map((h) => (
                <div key={h.id} className="pb-3 border-b border-line-soft last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-data text-ink-600">
                      {new Date(h.test_time).toLocaleDateString()}
                    </span>
                    <ResultPill result={h.connection_status} />
                  </div>
                  <p className="text-xs text-ink-600 mt-1">{h.remarks}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function DetailItem({ icon: Icon, label, value, mono }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-ink-600" />
      </div>
      <div className="min-w-0">
        <dt className="text-xs text-ink-600">{label}</dt>
        <dd className={`text-sm font-medium text-ink-900 truncate ${mono ? "font-mono-data" : ""}`}>{value}</dd>
      </div>
    </div>
  );
}
