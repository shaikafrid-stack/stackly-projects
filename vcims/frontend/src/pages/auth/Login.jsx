import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../../components/ErrorMessage';

const ROLE_HOME = {
  admin: '/admin/dashboard',
  finance_manager: '/finance/dashboard',
  vendor: '/vendor/dashboard',
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(ROLE_HOME[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email) => setForm({ email, password: 'Password123!' });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary-700">VCIMS</h1>
          <p className="text-slate-500 text-sm mt-1">Vendor Contract & Invoice Management System</p>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Sign in to your account</h2>
          <ErrorMessage message={error} />
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                className="input"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                className="input"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 mb-2">Quick demo login (password: Password123!):</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => fillDemo('admin@vcims.com')} className="btn btn-secondary text-xs py-1 px-2">Admin</button>
              <button onClick={() => fillDemo('finance@vcims.com')} className="btn btn-secondary text-xs py-1 px-2">Finance</button>
              <button onClick={() => fillDemo('vendor@vcims.com')} className="btn btn-secondary text-xs py-1 px-2">Vendor</button>
            </div>
          </div>

          <p className="text-sm text-slate-500 mt-4 text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-medium">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
