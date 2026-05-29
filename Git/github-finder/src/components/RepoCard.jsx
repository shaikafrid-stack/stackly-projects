import { getLangColor } from '../utils/langColors'

export default function RepoCard({ repo }) {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="card-hover p-4 flex flex-col gap-2 no-underline"
    >
      {/* Name */}
      <div className="flex items-start justify-between gap-2">
        <span
          className="font-mono text-sm font-bold text-[--accent2] truncate hover:underline"
        >
          {repo.name}
        </span>
        {/* Stars */}
        <span className="flex items-center gap-1 text-xs text-[--text-muted] flex-shrink-0 font-mono">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {fmtStars(repo.stargazers_count)}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-[--text-muted] font-mono leading-relaxed line-clamp-2 flex-1">
        {repo.description || <span className="italic opacity-50">No description</span>}
      </p>

      {/* Language */}
      {repo.language && (
        <div className="flex items-center gap-1.5 mt-auto">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: getLangColor(repo.language) }}
          />
          <span className="text-[11px] text-[--text-muted] font-mono">{repo.language}</span>
        </div>
      )}
    </a>
  )
}

function fmtStars(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}
