// ─── Theme ───────────────────────────────────────────────────────────────────
export function getTheme() {
  try {
    return localStorage.getItem('gh-finder-theme') || 'light'
  } catch {
    return 'light'
  }
}

export function setTheme(theme) {
  try {
    localStorage.setItem('gh-finder-theme', theme)
  } catch {}
}

// ─── Search History ───────────────────────────────────────────────────────────
const HISTORY_KEY = 'gh-finder-history'
const MAX_HISTORY = 5

export function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addToHistory(username) {
  try {
    const prev = getHistory().filter((u) => u.toLowerCase() !== username.toLowerCase())
    const next = [username, ...prev].slice(0, MAX_HISTORY)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
    return next
  } catch {
    return []
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch {}
}
