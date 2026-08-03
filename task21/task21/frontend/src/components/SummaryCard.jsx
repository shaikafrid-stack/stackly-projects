export default function SummaryCard({ label, value, icon: Icon, tint = "accent" }) {
  const tints = {
    accent: "bg-accent-soft text-accent-dark",
    success: "bg-success-soft text-success",
    danger: "bg-danger-soft text-danger",
    indigo: "bg-indigo-soft text-indigo",
    warning: "bg-warning-soft text-warning",
  };
  return (
    <div className="bg-white border border-line rounded-xl2 p-5 shadow-card flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">{label}</p>
        <p className="text-3xl font-bold text-ink-900 mt-2 font-mono-data">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tints[tint]}`}>
        <Icon size={20} strokeWidth={2.2} />
      </div>
    </div>
  );
}
