import { useState, useCallback } from 'react'

export function useGithubUser() {
  const [user, setUser] = useState(null)
  const [repos, setRepos] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')

  const fetchUser = useCallback(async (username) => {
    if (!username.trim()) return

    setStatus('loading')
    setUser(null)
    setRepos([])
    setErrorMsg('')

    try {
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`),
        fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=6`),
      ])

      if (userRes.status === 404) {
        setStatus('error')
        setErrorMsg(`No user found for "${username}". Check the spelling and try again.`)
        return
      }

      if (userRes.status === 403) {
        setStatus('error')
        setErrorMsg('GitHub API rate limit reached (60 req/hr). Please wait a minute and try again.')
        return
      }

      if (!userRes.ok) {
        setStatus('error')
        setErrorMsg(`Something went wrong (${userRes.status}). Please try again.`)
        return
      }

      const userData = await userRes.json()
      const reposData = reposRes.ok ? await reposRes.json() : []

      setUser(userData)
      setRepos(Array.isArray(reposData) ? reposData : [])
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg('Network error. Please check your connection and try again.')
    }
  }, [])

  return { user, repos, status, errorMsg, fetchUser }
}
