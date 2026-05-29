export default function ProfileCard({ user }) {
  return (
    <div className="card fade-in p-6 flex flex-col sm:flex-row gap-6">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <a href={user.html_url} target="_blank" rel="noopener noreferrer">
          <img
            src={user.avatar_url}
            alt={user.login}
            className="w-24 h-24 rounded-xl border-2 border-[--border] hover:border-[--accent] transition-all duration-200 hover:shadow-lg"
          />
        </a>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <h2 className="font-display font-800 text-xl" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>
              {user.name || user.login}
            </h2>
            <a
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[--accent2] font-mono text-sm hover:underline"
            >
              @{user.login}
            </a>
          </div>
          <a
            href={user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 chip hover:border-[--accent2] hover:text-[--accent2] text-xs"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02.005 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            View Profile
          </a>
        </div>

        {user.bio && (
          <p className="mt-2 text-sm text-[--text-muted] font-mono leading-relaxed line-clamp-2">
            {user.bio}
          </p>
        )}

        {user.location && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-[--text-muted]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {user.location}
          </p>
        )}

        {/* Stats */}
        <div className="mt-4 flex flex-wrap gap-4">
          <Stat label="Followers" value={fmt(user.followers)} />
          <Stat label="Following" value={fmt(user.following)} />
          <Stat label="Public Repos" value={fmt(user.public_repos)} accent />
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, accent }) {
  return (
    <div className="text-center">
      <div
        className="font-display font-bold text-lg leading-none"
        style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700,
          color: accent ? 'var(--accent)' : 'var(--text)',
        }}
      >
        {value}
      </div>
      <div className="text-[10px] text-[--text-muted] mt-0.5 uppercase tracking-wider">{label}</div>
    </div>
  )
}

function fmt(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}
