import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Search, Eye, Database as DbIcon } from "lucide-react";
import AppLayout from "../../components/AppLayout";
import { Input, Select } from "../../components/FormField";
import { StatusPill, ResultPill, EnvPill, DbTypeTag } from "../../components/Badges";
import Pagination from "../../components/Pagination";
import EmptyState from "../../components/EmptyState";
import { InlineLoading } from "../../components/LoadingScreen";
import { listDataSources } from "../../api/dataSources";

const DB_TYPES = ["MySQL", "PostgreSQL", "Oracle", "SQL Server", "MongoDB", "Snowflake", "Redshift", "BigQuery"];
const ENVIRONMENTS = ["Development", "Testing", "Production"];

export default function AvailableDataSources() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dbType, setDbType] = useState("");
  const [environment, setEnvironment] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(() => {
    setLoading(true);
    listDataSources({
      search, database_type: dbType, environment, status: activeOnly ? "Active" : "", page, limit: 10,
    })
      .then(({ data }) => {
        setRows(data.data);
        setPagination(data.pagination);
      })
      .catch(() => toast.error("Failed to load data sources."))
      .finally(() => setLoading(false));
  }, [search, dbType, environment, activeOnly, page]);

  useEffect(() => {
    const t = setTimeout(fetchData, 250);
    return () => clearTimeout(t);
  }, [fetchData]);

  return (
    <AppLayout title="Available Data Sources" subtitle="Browse and search registered database connections (read-only).">
      <div className="bg-white border border-line rounded-xl2 shadow-card">
        <div className="p-4 border-b border-line flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600" />
            <Input
              placeholder="Search by name, host, or database…"
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select value={dbType} onChange={(e) => { setDbType(e.target.value); setPage(1); }} className="w-auto">
            <option value="">All Database Types</option>
            {DB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select value={environment} onChange={(e) => { setEnvironment(e.target.value); setPage(1); }} className="w-auto">
            <option value="">All Environments</option>
            {ENVIRONMENTS.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <label className="flex items-center gap-2 text-sm font-medium text-ink-900 px-3 py-2.5 rounded-lg border border-line cursor-pointer">
            <input
              type="checkbox"
              className="accent-accent"
              checked={activeOnly}
              onChange={(e) => { setActiveOnly(e.target.checked); setPage(1); }}
            />
            Active only
          </label>
        </div>

        {loading ? (
          <InlineLoading label="Loading data sources…" />
        ) : rows.length === 0 ? (
          <EmptyState icon={DbIcon} title="No data sources found" message="Try adjusting your search or filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-ink-600 uppercase tracking-wide border-b border-line">
                  <th className="px-4 py-3">Connection Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Environment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Result</th>
                  <th className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-muted/60 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink-900">{r.connection_name}</p>
                      <p className="text-xs text-ink-600">{r.category}</p>
                    </td>
                    <td className="px-4 py-3"><DbTypeTag type={r.database_type} /></td>
                    <td className="px-4 py-3"><EnvPill env={r.environment} /></td>
                    <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                    <td className="px-4 py-3"><ResultPill result={r.last_result} /></td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate(`/analyst/data-sources/${r.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-line hover:bg-surface-subtle text-ink-900"
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && rows.length > 0 && (
          <div className="px-4">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onChange={setPage}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
