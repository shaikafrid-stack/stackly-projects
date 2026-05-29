import { useState, useEffect } from 'react'

export default function SearchBar({ onSearch, history, onHistoryClick, onClearHistory }) {
  const [value, setValue] = useState('')

  // Debounce: useEffect + setTimeout — no external library
  useEffect(() => {
    if (!value.trim()) return
    const timer = setTimeout(() => {
      onSearch(value.trim())
    }, 300)
    return () => clearTimeout(timer) // cleanup on every keystroke
  }, [value])

  function handleSubmit(e) {
    e.preventDefault()
    if (value.trim()) onSearch(value.trim())
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[--text-muted] pointer-events-none">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            className="input-field pl-9"
            type="text"
            placeholder="Search a GitHub username…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />
        </div>
        <button type="submit" className="btn-primary whitespace-nowrap">
          Search
        </button>
      </form>

      {/* Search History */}
      {history.length > 0 && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-[--text-muted] text-xs font-mono">Recent:</span>
          {history.map((u) => (
            <button
              key={u}
              className="chip"
              onClick={() => {
                setValue(u)
                onHistoryClick(u)
              }}
            >
              {u}
            </button>
          ))}
          <button
            className="chip text-[10px] opacity-60 hover:opacity-100"
            onClick={onClearHistory}
            title="Clear history"
          >
            ✕ clear
          </button>
        </div>
      )}
    </div>
  )
}
