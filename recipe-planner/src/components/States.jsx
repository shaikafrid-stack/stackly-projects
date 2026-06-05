export function SkeletonCard() {
  return (
    <div className="card">
      <div className="skeleton aspect-video w-full" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 12 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="text-4xl animate-bounce">🍳</div>
      <p style={{ color: 'var(--muted)' }} className="font-medium">Cooking up results…</p>
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', message = '', icon = '🔍' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
      <span className="text-5xl">{icon}</span>
      <h3 className="font-display text-xl font-semibold" style={{ color: 'var(--text)' }}>{title}</h3>
      {message && <p className="max-w-sm" style={{ color: 'var(--muted)' }}>{message}</p>}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <span className="text-5xl">⚠️</span>
      <h3 className="font-display text-xl font-semibold" style={{ color: 'var(--text)' }}>Oops!</h3>
      <p style={{ color: 'var(--muted)' }}>{message}</p>
      {onRetry && <button onClick={onRetry} className="btn-primary mt-2">Try Again</button>}
    </div>
  );
}
