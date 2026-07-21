import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const roleHome = { admin: '/admin', manager: '/manager', employee: '/employee' };

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}`);
      navigate(roleHome[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1 text-center">PerformTrack</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Employee Performance &amp; Goal Tracking</p>

        {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-5">
          No account? <Link to="/register" className="text-brand-600 font-medium">Register</Link>
        </p>

        <div className="mt-6 text-xs text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="font-semibold mb-1">Test credentials (after seeding):</p>
          <p>Admin: admin@company.com / Admin@123</p>
          <p>Manager: manager@company.com / Manager@123</p>
          <p>Employee: employee@company.com / Employee@123</p>
        </div>
      </div>
    </div>
  );
}
