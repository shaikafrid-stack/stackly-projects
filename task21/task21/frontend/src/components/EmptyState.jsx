export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-surface-subtle flex items-center justify-center mb-4">
          <Icon size={22} className="text-ink-600" strokeWidth={2} />
        </div>
      )}
      <p className="font-semibold text-ink-900">{title}</p>
      {message && <p className="text-sm text-ink-600 mt-1 max-w-sm">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
