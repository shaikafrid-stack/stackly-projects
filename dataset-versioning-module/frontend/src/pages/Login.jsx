import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { username: 'admin', password: 'admin123', role: 'Admin', desc: 'Full access: create, restore & manage versions' },
  { username: 'steward', password: 'steward123', role: 'Data Steward', desc: 'Create, compare & manage versions' },
  { username: 'analyst', password: 'analyst123', role: 'Data Analyst', desc: 'View & compare versions only' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  const ROLE_DOTS = { Admin: 'bg-accent-amber', 'Data Steward': 'bg-accent-teal', 'Data Analyst': 'bg-accent-sky' };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-brand-950 via-brand-700 to-violet-700 px-4 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-grid-pattern bg-[size:36px_36px] opacity-40" />
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-accent-violet/30 blur-3xl" />
      <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-accent-teal/20 blur-3xl" />
      <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-accent-rose/10 blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-7">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/30 backdrop-blur flex items-center justify-center text-white font-extrabold text-xl mb-4 shadow-xl">
            📊
          </div>
          <h1 className="text-white text-2xl font-extrabold tracking-tight">DataLineage Console</h1>
          <p className="text-brand-100/90 text-sm mt-1.5">Dataset Versioning, Lineage &amp; Change Tracking</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl ring-1 ring-white/40 p-7 space-y-4">
          {error && <div className="rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 text-sm">{error}</div>}
          <div>
            <label className="label">Username</label>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>

          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-2.5 flex items-center gap-1.5">
              <span>✨</span> Demo accounts — click to autofill
            </p>
            <div className="space-y-1.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  type="button"
                  key={acc.username}
                  onClick={() => {
                    setUsername(acc.username);
                    setPassword(acc.password);
                  }}
                  className="w-full flex items-center gap-3 text-left rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/60 hover:shadow-sm px-3 py-2.5 transition-all"
                >
                  <span className={`h-2 w-2 rounded-full shrink-0 ${ROLE_DOTS[acc.role]}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {acc.role} <span className="font-mono font-normal text-slate-400">· {acc.username}</span>
                    </p>
                    <p className="text-[11px] text-slate-500">{acc.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </form>

        <p className="text-center text-brand-100/60 text-[11px] mt-5">Task 27 · Full-Stack Versioning Module</p>
      </div>
    </div>
  );
}
