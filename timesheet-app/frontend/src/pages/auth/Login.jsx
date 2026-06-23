import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('All fields are required'); return }
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      navigate(user.role === 'manager' ? '/manager' : '/employee')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>⏰ Time<span>Track</span></h1>
          <p>Employee Project & Timesheet Management</p>
        </div>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-control" type="email" placeholder="you@company.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <button className="btn btn-primary auth-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div style={{marginTop: 16, padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--gray-500)'}}>
          <strong>Demo credentials:</strong><br />
          Manager: manager@demo.com / manager123<br />
          Employee: bob@demo.com / employee123
        </div>
        <div className="auth-footer">
          Don't have an account? <Link to="/register" style={{color: 'var(--primary)', fontWeight: 500}}>Register</Link>
        </div>
      </div>
    </div>
  )
}
