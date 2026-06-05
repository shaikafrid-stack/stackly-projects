export default function Pagination({ page, totalPages, goTo }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page === 1}
        className="btn-ghost px-3 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ← Prev
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} style={{ color: 'var(--muted)' }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p)}
            className="w-9 h-9 rounded-lg text-sm font-medium transition-all"
            style={{
              background: page === p ? 'var(--accent)' : 'var(--surface)',
              color: page === p ? 'white' : 'var(--text)',
              border: '1px solid var(--border)',
            }}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => goTo(page + 1)}
        disabled={page === totalPages}
        className="btn-ghost px-3 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </div>
  );
}
