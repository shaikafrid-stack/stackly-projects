import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Save, ArrowLeft, Eye, EyeOff } from "lucide-react";
import AppLayout from "../../components/AppLayout";
import Button from "../../components/Button";
import { Field, Input, Select } from "../../components/FormField";
import { InlineLoading } from "../../components/LoadingScreen";
import { createDataSource, updateDataSource, getDataSource } from "../../api/dataSources";

const DB_TYPES = ["MySQL", "PostgreSQL", "Oracle", "SQL Server", "MongoDB", "Snowflake", "Redshift", "BigQuery"];
const ENVIRONMENTS = ["Development", "Testing", "Production"];
const DEFAULT_PORTS = {
  MySQL: 3306, PostgreSQL: 5432, Oracle: 1521, "SQL Server": 1433,
  MongoDB: 27017, Snowflake: 443, Redshift: 5439, BigQuery: 443,
};

const emptyForm = {
  connection_name: "", database_type: "MySQL", host: "", port: 3306, database_name: "",
  username: "", password: "", environment: "Development", category: "General", status: "Active",
};

export default function DataSourceForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    getDataSource(id)
      .then(({ data }) => setForm({ ...data.data, password: "" }))
      .catch(() => toast.error("Could not load data source."))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function onDbTypeChange(type) {
    setForm((f) => ({ ...f, database_type: type, port: DEFAULT_PORTS[type] ?? f.port }));
  }

  function validate() {
    const e = {};
    if (!form.connection_name.trim()) e.connection_name = "Connection name is required.";
    if (!form.host.trim()) e.host = "Host is required.";
    if (!form.port || form.port < 1 || form.port > 65535) e.port = "Enter a valid port (1–65535).";
    if (!form.database_name.trim()) e.database_name = "Database name is required.";
    if (!form.username.trim()) e.username = "Username is required.";
    if (!isEdit && !form.password) e.password = "Password is required.";
    if (isEdit && !form.password) e.password = "Re-enter password to confirm changes.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, port: Number(form.port) };
      if (isEdit) {
        await updateDataSource(id, payload);
        toast.success("Data source updated successfully.");
      } else {
        await createDataSource(payload);
        toast.success("Data source created successfully.");
      }
      navigate("/admin/data-sources");
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const mapped = {};
        apiErrors.forEach((er) => { mapped[er.path || er.param] = er.msg; });
        setErrors(mapped);
      }
      toast.error(err.response?.data?.message || "Could not save data source.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout
      title={isEdit ? "Edit Data Source" : "Add Data Source"}
      subtitle={isEdit ? "Update this connection profile." : "Register a new database connection profile."}
      actions={
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate("/admin/data-sources")}>
          Back to list
        </Button>
      }
    >
      {loading ? (
        <InlineLoading label="Loading data source…" />
      ) : (
        <form onSubmit={handleSubmit} className="max-w-3xl bg-white border border-line rounded-xl2 shadow-card p-6">
          <SectionTitle>Connection Details</SectionTitle>
          <div className="grid sm:grid-cols-2 gap-x-4">
            <Field label="Connection Name" required error={errors.connection_name}>
              <Input
                placeholder="e.g. Core Banking MySQL"
                value={form.connection_name}
                onChange={(e) => update("connection_name", e.target.value)}
                error={errors.connection_name}
              />
            </Field>
            <Field label="Database Type" required>
              <Select value={form.database_type} onChange={(e) => onDbTypeChange(e.target.value)}>
                {DB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Category" hint="Used to group data sources on the list view.">
              <Input placeholder="e.g. Finance, Analytics" value={form.category} onChange={(e) => update("category", e.target.value)} />
            </Field>
            <Field label="Environment" required>
              <Select value={form.environment} onChange={(e) => update("environment", e.target.value)}>
                {ENVIRONMENTS.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
          </div>

          <SectionTitle className="mt-2">Host & Credentials</SectionTitle>
          <div className="grid sm:grid-cols-3 gap-x-4">
            <Field label="Host Name" required error={errors.host} hint="e.g. db-prod-01.internal">
              <Input
                className="font-mono-data"
                value={form.host}
                onChange={(e) => update("host", e.target.value)}
                error={errors.host}
              />
            </Field>
            <Field label="Port" required error={errors.port}>
              <Input
                type="number"
                className="font-mono-data"
                value={form.port}
                onChange={(e) => update("port", e.target.value)}
                error={errors.port}
              />
            </Field>
            <Field label="Database Name" required error={errors.database_name}>
              <Input
                className="font-mono-data"
                value={form.database_name}
                onChange={(e) => update("database_name", e.target.value)}
                error={errors.database_name}
              />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-4">
            <Field label="Username" required error={errors.username}>
              <Input
                className="font-mono-data"
                autoComplete="off"
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
                error={errors.username}
              />
            </Field>
            <Field
              label="Password"
              required
              error={errors.password}
              hint={isEdit ? "Stored masked. Re-enter to update or confirm current value." : undefined}
            >
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  className="font-mono-data pr-10"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  error={errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-600 hover:text-ink-900"
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
          </div>

          <SectionTitle className="mt-2">Status</SectionTitle>
          <div className="flex items-center gap-6 mb-2">
            <label className="flex items-center gap-2 text-sm font-medium text-ink-900">
              <input
                type="radio"
                name="status"
                checked={form.status === "Active"}
                onChange={() => update("status", "Active")}
                className="accent-accent"
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-ink-900">
              <input
                type="radio"
                name="status"
                checked={form.status === "Inactive"}
                onChange={() => update("status", "Inactive")}
                className="accent-accent"
              />
              Inactive
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-line">
            <Button type="button" variant="ghost" onClick={() => navigate("/admin/data-sources")}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" icon={Save} loading={saving}>
              {isEdit ? "Save Changes" : "Create Data Source"}
            </Button>
          </div>
        </form>
      )}
    </AppLayout>
  );
}

function SectionTitle({ children, className = "" }) {
  return (
    <p className={`text-xs font-bold uppercase tracking-wide text-ink-600 mb-3 pb-2 border-b border-line-soft ${className}`}>
      {children}
    </p>
  );
}
