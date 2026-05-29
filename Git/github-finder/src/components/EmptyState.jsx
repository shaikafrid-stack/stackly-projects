export default function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-5 py-14 text-center fade-in">
      {/* Minimal octocat-ish illustration */}
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="38" stroke="var(--border)" strokeWidth="2" strokeDasharray="6 4" />
        <circle cx="40" cy="32" r="14" fill="var(--surface2)" stroke="var(--border)" strokeWidth="1.5" />
        <path d="M16 62c0-13.255 10.745-24 24-24s24 10.745 24 24" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="35" cy="30" r="2" fill="var(--text-muted)" />
        <circle cx="45" cy="30" r="2" fill="var(--text-muted)" />
        <path d="M36 36c1 1.5 3 1.5 4 0" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      <div>
        <h3
          className="font-bold text-lg mb-1"
          style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}
        >
          Search for a GitHub user
        </h3>
        <p className="text-sm text-[--text-muted] font-mono max-w-xs">
          Type a username above to explore their profile and top repositories.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {['torvalds', 'gaearon', 'sindresorhus', 'yyx990803'].map((u) => (
          <span key={u} className="chip text-xs opacity-60">
            {u}
          </span>
        ))}
      </div>
    </div>
  )
}
