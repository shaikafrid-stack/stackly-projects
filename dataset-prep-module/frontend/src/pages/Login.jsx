import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DEMO_USERS = [
  { role: 'Administrator', email: 'admin@dpm.com' },
  { role: 'Data Steward', email: 'steward@dpm.com' },
  { role: 'Data Analyst', email: 'analyst@dpm.com' }
];

export default function Login() {
  const { user, login, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@dpm.com');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-400/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl" />

      <div className="relative w-full max-w-4xl grid lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl">
        {/* Left brand panel */}
        <div className="hidden lg:flex flex-col justify-between bg-brand-gradient p-10 text-white">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-xl">
              <Sparkles size={22} />
            </div>
            <span className="font-extrabold text-lg">DataPrep Studio</span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold leading-tight mb-3">Dataset Preparation & Transformation Module</h1>
            <p className="text-white/80 text-sm leading-relaxed">
              Select a dataset, inspect its structure, build a transformation pipeline,
              validate the results, and publish clean, versioned prepared datasets.
            </p>
          </div>
          <div className="flex gap-2 text-xs text-white/70">
            <span className="badge bg-white/15 text-white">React</span>
            <span className="badge bg-white/15 text-white">Node.js</span>
            <span className="badge bg-white/15 text-white">MySQL</span>
          </div>
        </div>

        {/* Right form panel */}
        <div className="bg-white p-8 sm:p-10">
          <h2 className="text-2xl font-extrabold text-slate-800">Sign in</h2>
          <p className="page-subtitle mb-6">Access your dataset preparation workspace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-10" placeholder="you@company.com" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-10" placeholder="••••••••" />
              </div>
            </div>

            {error && <p className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Sign in <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Demo credentials (password: Password123!)</p>
            <div className="space-y-1.5">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.email}
                  onClick={() => { setEmail(u.email); setPassword('Password123!'); }}
                  className="w-full flex items-center justify-between text-xs bg-slate-50 hover:bg-brand-50 rounded-lg px-3 py-2 transition"
                >
                  <span className="font-medium text-slate-600">{u.role}</span>
                  <span className="text-slate-400">{u.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
