export function StatusPill({ status }) {
  const isActive = status === "Active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        isActive ? "bg-success-soft text-success" : "bg-line-soft text-ink-600"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive ? "bg-success animate-pulseDot" : "bg-ink-600/40"
        }`}
      />
      {status}
    </span>
  );
}

export function ResultPill({ result }) {
  const map = {
    Success: "bg-success-soft text-success",
    Failed: "bg-danger-soft text-danger",
    "Not Tested": "bg-line-soft text-ink-600",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${map[result] || map["Not Tested"]}`}>
      {result}
    </span>
  );
}

export function EnvPill({ env }) {
  const map = {
    Production: "bg-danger-soft text-danger",
    Testing: "bg-warning-soft text-warning",
    Development: "bg-indigo-soft text-indigo",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${map[env] || "bg-line-soft text-ink-600"}`}>
      {env}
    </span>
  );
}

const DB_COLORS = {
  MySQL: "#00758F",
  PostgreSQL: "#336791",
  Oracle: "#F80000",
  "SQL Server": "#CC2927",
  MongoDB: "#12B76A",
  Snowflake: "#29B5E8",
  Redshift: "#8C4FFF",
  BigQuery: "#5B5FEF",
};

export function DbTypeTag({ type }) {
  const color = DB_COLORS[type] || "#6B7280";
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold font-mono-data bg-surface-subtle text-ink-900 border border-line">
      <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />
      {type}
    </span>
  );
}
