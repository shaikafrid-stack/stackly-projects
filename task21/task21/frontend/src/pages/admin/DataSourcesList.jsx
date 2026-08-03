import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Search, Plus, Pencil, Trash2, Zap, Power, History, Layers, List, Database as DbIcon,
} from "lucide-react";
import AppLayout from "../../components/AppLayout";
import Button from "../../components/Button";
import { Input, Select } from "../../components/FormField";
import { StatusPill, ResultPill, EnvPill, DbTypeTag } from "../../components/Badges";
import Pagination from "../../components/Pagination";
import EmptyState from "../../components/EmptyState";
import { ConfirmDialog } from "../../components/Modal";
import { InlineLoading } from "../../components/LoadingScreen";
import {
  listDataSources, deleteDataSource, setStatus, testConnection,
} from "../../api/dataSources";

const DB_TYPES = ["MySQL", "PostgreSQL", "Oracle", "SQL Server", "MongoDB", "Snowflake", "Redshift", "BigQuery"];
const ENVIRONMENTS = ["Development", "Testing", "Production"];

export default function DataSourcesList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dbType, setDbType] = useState("");
  const [environment, setEnvironment] = useState("");
  const [status, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [groupView, setGroupView] = useState(false);
  const [testingId, setTestingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    listDataSources({
      search, database_type: dbType, environment, status, page, limit: 10,
    })
      .then(({ data }) => {
        setRows(data.data);
        setPagination(data.pagination);
      })
      .catch(() => toast.error("Failed to load data sources."))
      .finally(() => setLoading(false));
  }, [search, dbType, environment, status, page]);

  useEffect(() => {
    const t = setTimeout(fetchData, 250); // debounce search
    return () => clearTimeout(t);
  }, [fetchData]);

  async function handleTest(id) {
    setTestingId(id);
    try {
      const { data } = await testConnection(id);
      toast[data.result === "Success" ? "success" : "error"](
        `${data.message}${data.remarks ? " — " + data.remarks : ""}`
      );
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Test failed.");
    } finally {
      setTestingId(null);
    }
  }

  async function handleToggleStatus(row) {
    try {
      const next = row.status === "Active" ? "Inactive" : "Active";
      await setStatus(row.id, next);
      toast.success(`Connection ${next === "Active" ? "enabled" : "disabled"}.`);
      fetchData();
    } catch {
      toast.error("Could not update status.");
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteDataSource(confirmDelete.id);
      toast.success("Data source deleted.");
      setConfirmDelete(null);
      fetchData();
    } catch {
      toast.error("Could not delete data source.");
    } finally {
      setDeleting(false);
    }
  }

  const grouped = rows.reduce((acc, r) => {
    (acc[r.category] = acc[r.category] || []).push(r);
    return acc;
  }, {});

  return (
    <AppLayout
      title="Data Sources"
      subtitle="Register, validate, and manage database connection profiles."
      actions={
        <Button variant="accent" icon={Plus} onClick={() => navigate("/admin/data-sources/new")}>
          Add Data Source
        </Button>
      }
    >
      <div className="bg-white border border-line rounded-xl2 shadow-card">
        {/* Toolbar */}
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
          <Select value={status} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="w-auto">
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>
          <div className="flex items-center gap-1 bg-surface-subtle rounded-lg p-1 ml-auto">
            <button
              onClick={() => setGroupView(false)}
              className={`p-1.5 rounded-md ${!groupView ? "bg-white shadow-sm text-ink-900" : "text-ink-600"}`}
              aria-label="List view"
              title="List view"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setGroupView(true)}
              className={`p-1.5 rounded-md ${groupView ? "bg-white shadow-sm text-ink-900" : "text-ink-600"}`}
              aria-label="Group by category"
              title="Group by category"
            >
              <Layers size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <InlineLoading label="Loading data sources…" />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={DbIcon}
            title="No data sources found"
            message="Try adjusting your search or filters, or add a new data source."
            action={
              <Button variant="accent" icon={Plus} onClick={() => navigate("/admin/data-sources/new")}>
                Add Data Source
              </Button>
            }
          />
        ) : groupView ? (
          <div className="divide-y divide-line">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-ink-600 mb-3">
                  {cat} <span className="text-ink-600/60 font-normal">({items.length})</span>
                </p>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {items.map((r) => (
                    <SourceCard
                      key={r.id}
                      row={r}
                      onEdit={() => navigate(`/admin/data-sources/${r.id}/edit`)}
                      onDelete={() => setConfirmDelete(r)}
                      onTest={() => handleTest(r.id)}
                      onToggle={() => handleToggleStatus(r)}
                      onHistory={() => navigate(`/admin/history?source=${r.id}`)}
                      testing={testingId === r.id}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-ink-600 uppercase tracking-wide border-b border-line">
                  <th className="px-4 py-3">Connection Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Host / Port</th>
                  <th className="px-4 py-3">Environment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Result</th>
                  <th className="px-4 py-3">Last Tested</th>
                  <th className="px-4 py-3 text-right">Actions</th>
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
                    <td className="px-4 py-3 font-mono-data text-xs text-ink-600">{r.host}:{r.port}</td>
                    <td className="px-4 py-3"><EnvPill env={r.environment} /></td>
                    <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                    <td className="px-4 py-3"><ResultPill result={r.last_result} /></td>
                    <td className="px-4 py-3 text-xs text-ink-600">
                      {r.last_tested_at ? new Date(r.last_tested_at).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <RowActions
                        row={r}
                        testing={testingId === r.id}
                        onEdit={() => navigate(`/admin/data-sources/${r.id}/edit`)}
                        onDelete={() => setConfirmDelete(r)}
                        onTest={() => handleTest(r.id)}
                        onToggle={() => handleToggleStatus(r)}
                        onHistory={() => navigate(`/admin/history?source=${r.id}`)}
                      />
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

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete data source?"
        message={`This will permanently remove "${confirmDelete?.connection_name}" and its connection history. This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </AppLayout>
  );
}

function RowActions({ row, onEdit, onDelete, onTest, onToggle, onHistory, testing }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <IconBtn title="Test connection" onClick={onTest} loading={testing}><Zap size={15} /></IconBtn>
      <IconBtn title="View history" onClick={onHistory}><History size={15} /></IconBtn>
      <IconBtn title={row.status === "Active" ? "Disable" : "Enable"} onClick={onToggle}><Power size={15} /></IconBtn>
      <IconBtn title="Edit" onClick={onEdit}><Pencil size={15} /></IconBtn>
      <IconBtn title="Delete" onClick={onDelete} danger><Trash2 size={15} /></IconBtn>
    </div>
  );
}

function IconBtn({ children, onClick, title, danger, loading }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={loading}
      className={`p-2 rounded-lg hover:bg-surface-subtle transition-colors ${danger ? "text-danger hover:bg-danger-soft" : "text-ink-600 hover:text-ink-900"}`}
    >
      {loading ? <span className="block w-[15px] h-[15px] border-2 border-current border-t-transparent rounded-full animate-spin" /> : children}
    </button>
  );
}

function SourceCard({ row, onEdit, onDelete, onTest, onToggle, onHistory, testing }) {
  return (
    <div className="border border-line rounded-xl p-4 bg-white hover:shadow-card transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <p className="font-semibold text-ink-900 text-sm">{row.connection_name}</p>
        <StatusPill status={row.status} />
      </div>
      <div className="flex items-center gap-2 mb-2">
        <DbTypeTag type={row.database_type} />
        <EnvPill env={row.environment} />
      </div>
      <p className="font-mono-data text-xs text-ink-600 mb-3">{row.host}:{row.port}/{row.database_name}</p>
      <div className="flex items-center justify-between pt-3 border-t border-line-soft">
        <ResultPill result={row.last_result} />
        <RowActions row={row} onEdit={onEdit} onDelete={onDelete} onTest={onTest} onToggle={onToggle} onHistory={onHistory} testing={testing} />
      </div>
    </div>
  );
}
