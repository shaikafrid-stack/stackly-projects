import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import FormInput from '../components/FormInput.jsx';
import Button from '../components/Button.jsx';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password) errs.password = 'Password is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success('Logged in successfully.');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm card">
        <h1 className="text-xl font-bold text-brand-700 mb-1">Dataset & Metadata Management</h1>
        <p className="text-sm text-slate-500 mb-6">Sign in to continue</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Email"
            type="email"
            placeholder="you@company.com"
            value={form.email}
            error={errors.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <FormInput
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            error={errors.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Button type="submit" loading={loading} className="w-full">
            Login
          </Button>
        </form>

        <div className="mt-6 text-xs text-slate-400 border-t border-slate-200 pt-4">
          <p className="font-semibold mb-1">Demo credentials</p>
          <p>admin@task23.com / Password@123</p>
          <p>steward@task23.com / Password@123</p>
          <p>analyst@task23.com / Password@123</p>
        </div>
      </div>
    </div>
  );
}
