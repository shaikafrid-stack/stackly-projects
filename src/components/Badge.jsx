const STATUS_STYLES = {
  'In Stock': 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
  'Low Stock': 'bg-amber-500/15 text-amber-400 ring-amber-500/30',
  'Out of Stock': 'bg-rose-500/15 text-rose-400 ring-rose-500/30',
};

export default function Badge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES['In Stock'];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ${style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
