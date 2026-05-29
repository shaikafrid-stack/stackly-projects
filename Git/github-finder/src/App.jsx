import { useState, useEffect } from 'react'
import SearchBar from './components/SearchBar'
import ProfileCard from './components/ProfileCard'
import RepoCard from './components/RepoCard'
import Loader from './components/Loader'
import ErrorState from './components/ErrorState'
import EmptyState from './components/EmptyState'
import { useGithubUser } from './hooks/useGithubUser'
import { getTheme, setTheme, getHistory, addToHistory, clearHistory } from './utils/storage'

export default function App() {
  const { user, repos, status, errorMsg, fetchUser } = useGithubUser()
  const [isDark, setIsDark] = useState(() => getTheme() === 'dark')
  const [history, setHistory] = useState(getHistory)

  // Apply dark mode class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    setTheme(isDark ? 'dark' : 'light')
  }, [isDark])

  function handleSearch(username) {
    fetchUser(username)
    const next = addToHistory(username)
    setHistory(next)
  }

  function handleHistoryClick(username) {
    fetchUser(username)
  }

  function handleClearHistory() {
    clearHistory()
    setHistory([])
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <header
        className="border-b sticky top-0 z-10 backdrop-blur-sm"
        style={{ borderColor: 'var(--border)', backgroundColor: 'color-mix(in srgb, var(--bg) 85%, transparent)' }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--accent)' }}>
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02.005 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span
              className="font-bold text-base tracking-tight"
              style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }}
            >
              GH Finder
            </span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setIsDark((d) => !d)}
            className="chip flex items-center gap-1.5"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
                Light
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                Dark
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-2">
          <h1
            className="text-3xl sm:text-4xl font-bold"
            style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }}
          >
            GitHub Profile Finder
          </h1>
          <p className="text-sm text-[--text-muted] font-mono">
            Search any GitHub username to explore their profile & top repos
          </p>
        </div>

        {/* Search */}
        <SearchBar
          onSearch={handleSearch}
          history={history}
          onHistoryClick={handleHistoryClick}
          onClearHistory={handleClearHistory}
        />

        {/* States */}
        {status === 'idle' && <EmptyState />}
        {status === 'loading' && <Loader />}
        {status === 'error' && <ErrorState message={errorMsg} />}

        {status === 'success' && user && (
          <div className="space-y-4 fade-in">
            <ProfileCard user={user} />

            {repos.length > 0 && (
              <div>
                <h2
                  className="text-sm font-bold mb-3 flex items-center gap-2"
                  style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}
                >
                  <span
                    className="w-1.5 h-4 rounded-sm inline-block"
                    style={{ backgroundColor: 'var(--accent)' }}
                  />
                  Top Repositories
                  <span className="text-[--text-muted] font-mono font-normal text-xs">
                    (by stars)
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {repos.map((repo) => (
                    <RepoCard key={repo.id} repo={repo} />
                  ))}
                </div>
              </div>
            )}

            {repos.length === 0 && (
              <p className="text-center text-sm text-[--text-muted] font-mono py-4">
                No public repositories found.
              </p>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center pb-8 text-xs text-[--text-muted] font-mono">
        Built with React + Tailwind · GitHub Public API · 60 req/hr limit
      </footer>
    </div>
  )
}
