import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { History, CheckCircle2, XCircle, Filter } from "lucide-react";
import AppLayout from "../../components/AppLayout";
import { Select } from "../../components/FormField";
import { ResultPill } from "../../components/Badges";
import { InlineLoading } from "../../components/LoadingScreen";
import EmptyState from "../../components/EmptyState";
import { listDataSources, getHistory } from "../../api/dataSources";

export default function ConnectionHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const preselected = searchParams.get("source") || "";

  const [sources, setSources] = useState([]);
  const [selected, setSelected] = useState(preselected);
  const [history, setHistory] = useState([]);
  const [resultFilter, setResultFilter] = useState("");
  const [loadingSources, setLoadingSources] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    listDataSources({ limit: 100 })
      .then(({ data }) => {
        setSources(data.data);
        if (!selected && data.data.length > 0) {
          setSelected(String(preselected || data.data[0].id));
        }
      })
      .catch(() => toast.error("Failed to load data sources."))
      .finally(() => setLoadingSources(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoadingHistory(true);
    getHistory(selected)
      .then(({ data }) => setHistory(data.data))
      .catch(() => toast.error("Failed to load connection history."))
      .finally(() => setLoadingHistory(false));
  }, [selected]);

  function onSelectSource(id) {
    setSelected(id);
    setSearchParams({ source: id });
  }

  const filtered = resultFilter ? history.filter((h) => h.connection_status === resultFilter) : history;
  const successCount = history.filter((h) => h.connection_status === "Success").length;
  const failedCount = history.filter((h) => h.connection_status === "Failed").length;

  return (
    <AppLayout title="Connection History" subtitle="Full audit trail of connection tests for each data source.">
      {loadingSources ? (
        <InlineLoading label="Loading data sources…" />
      ) : sources.length === 0 ? (
        <EmptyState icon={History} title="No data sources yet" message="Add a data source first to see its connection history." />
      ) : (
        <div className="grid lg:grid-cols-[280px_1fr] gap-5">
          {/* Source picker */}
          <div className="bg-white border border-line rounded-xl2 shadow-card p-2 h-fit max-h-[70vh] overflow-y-auto">
            {sources.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectSource(String(s.id))}
                className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                  String(selected) === String(s.id) ? "bg-accent-soft border border-accent/30" : "hover:bg-surface-subtle border border-transparent"
                }`}
              >
                <p className="text-sm font-semibold text-ink-900 truncate">{s.connection_name}</p>
                <p className="text-xs text-ink-600 font-mono-data truncate">{s.host}</p>
              </button>
            ))}
          </div>

          {/* History table */}
          <div className="bg-white border border-line rounded-xl2 shadow-card">
            <div className="p-4 border-b border-line flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-sm text-success font-semibold">
                  <CheckCircle2 size={15} /> {successCount} success
                </div>
                <div className="flex items-center gap-1.5 text-sm text-danger font-semibold">
                  <XCircle size={15} /> {failedCount} failed
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-ink-600" />
                <Select value={resultFilter} onChange={(e) => setResultFilter(e.target.value)} className="w-auto">
                  <option value="">All Results</option>
                  <option value="Success">Success</option>
                  <option value="Failed">Failed</option>
                </Select>
              </div>
            </div>

            {loadingHistory ? (
              <InlineLoading label="Loading history…" />
            ) : filtered.length === 0 ? (
              <EmptyState icon={History} title="No test history" message="This data source hasn't been tested yet, or no records match your filter." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-ink-600 uppercase tracking-wide border-b border-line">
                      <th className="px-4 py-3">Test Time</th>
                      <th className="px-4 py-3">Result</th>
                      <th className="px-4 py-3">Tested By</th>
                      <th className="px-4 py-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-soft">
                    {filtered.map((h) => (
                      <tr key={h.id} className="hover:bg-surface-muted/60">
                        <td className="px-4 py-3 text-xs font-mono-data text-ink-600">
                          {new Date(h.test_time).toLocaleString()}
                        </td>
                        <td className="px-4 py-3"><ResultPill result={h.connection_status} /></td>
                        <td className="px-4 py-3 text-ink-900">{h.tested_by_name || "System"}</td>
                        <td className="px-4 py-3 text-ink-600">{h.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
