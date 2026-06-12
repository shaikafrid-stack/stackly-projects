import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { loginSchema, LoginFormValues } from '../utils/validation';
import { FormField, Spinner } from '../components/ui';
import toast from 'react-hot-toast';
import { MOCK_USERS } from '../utils/mockData';

const Login: React.FC = () => {
  const { login } = useAuth();
  const { logActivity } = useApp();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      const user = MOCK_USERS.find(u => u.email === data.email);
      if (user) {
        logActivity({
          userId: user.id, userName: user.name, action: 'login', module: 'auth',
          description: 'Logged into the system', timestamp: new Date().toISOString(), status: 'success',
        });
      }
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.error ?? 'Login failed');
    }
  };

  // Quick login helpers for demo
  const quickLogins = [
    { label: 'Super Admin', email: 'affu@workspace.io', password: 'admin123' },
    { label: 'Proj. Manager', email: 'afrid@workspace.io', password: 'pm123' },
    { label: 'Team Lead', email: 'Affu@workspace.io', password: 'lead123' },
    { label: 'Team Member', email: 'msd@workspace.io', password: 'member123' },
    { label: 'Viewer', email: 'thala@workspace.io', password: 'view123' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <Building2 size={20} />
          </div>
          <span className="text-xl font-bold">WorkSpace Portal</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Manage your team<br />with confidence.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            Role-based access, project tracking, and real-time activity logs — all in one place.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[['12+', 'Team Members'], ['8', 'Active Projects'], ['100%', 'Uptime']].map(([val, lbl]) => (
            <div key={lbl} className="text-center">
              <div className="text-2xl font-bold text-blue-400">{val}</div>
              <div className="text-sm text-slate-400">{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">WorkSpace</span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Sign in</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-7">Enter your credentials to access your workspace.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <FormField label="Email address" error={errors.email?.message} required>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@workspace.io"
                    className="input-field pl-9"
                  />
                </div>
              </FormField>

              <FormField label="Password" error={errors.password?.message} required>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Your password"
                    className="input-field pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </FormField>

              <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={isSubmitting}>
                {isSubmitting ? <Spinner size="sm" /> : 'Sign in'}
              </button>
            </form>

            {/* Quick logins */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-400 text-center mb-3 font-medium uppercase tracking-wider">Quick access (demo)</p>
              <div className="grid grid-cols-5 gap-1.5">
                {quickLogins.map(ql => (
                  <button
                    key={ql.label}
                    onClick={async () => {
                      const result = await login(ql.email, ql.password);
                      if (result.success) { toast.success('Signed in!'); navigate('/dashboard'); }
                    }}
                    className="text-xs py-1.5 px-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-center leading-tight"
                  >
                    {ql.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
