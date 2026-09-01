import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { role: 'Administrator', email: 'admin@dqp.com', password: 'Admin@123' },
  { role: 'Data Analyst', email: 'analyst@dqp.com', password: 'Analyst@123' },
  { role: 'Data Steward', email: 'steward@dqp.com', password: 'Steward@123' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-brand-600">DataQuality<span className="text-slate-800">Pro</span></h1>
          <p className="text-slate-500 text-sm mt-1">Dataset Profiling &amp; Data Quality Analysis</p>
        </div>
        <div className="card p-6">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Email</label>
              <input
                type="email"
                required
                className="input mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Password</label>
              <input
                type="password"
                required
                className="input mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
        <div className="card p-4 mt-4">
          <p className="text-xs font-medium text-slate-500 mb-2">Demo credentials</p>
          <div className="space-y-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                type="button"
                key={acc.email}
                onClick={() => {
                  setEmail(acc.email);
                  setPassword(acc.password);
                }}
                className="w-full flex items-center justify-between text-xs bg-slate-50 hover:bg-slate-100 rounded-md px-3 py-2"
              >
                <span className="font-medium text-slate-600">{acc.role}</span>
                <span className="text-slate-400">{acc.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
