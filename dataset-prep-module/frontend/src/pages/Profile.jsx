import React from 'react';
import { Mail, Shield, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const ROLE_DESCRIPTIONS = {
  ADMIN: 'Full access: view all datasets, manage transformation configurations, view history, and delete prepared versions.',
  DATA_STEWARD: 'Can select datasets, apply transformations, validate transformed data, create prepared versions, and view history.',
  DATA_ANALYST: 'Can view and preview datasets, apply permitted transformations, and view prepared versions and history.'
};

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="page-title">Profile</p>
        <p className="page-subtitle">Your account details and permissions.</p>
      </div>

      <div className="card p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center text-white font-extrabold text-2xl shadow-glow">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-800">{user?.name}</p>
            <StatusBadge status={user?.role} className="mt-1" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail size={16} className="text-brand-500" />
            <span className="text-slate-500">Email</span>
            <span className="ml-auto font-medium text-slate-700">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Shield size={16} className="text-brand-500" />
            <span className="text-slate-500">Role</span>
            <span className="ml-auto font-medium text-slate-700">{user?.role?.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar size={16} className="text-brand-500" />
            <span className="text-slate-500">Session</span>
            <span className="ml-auto font-medium text-slate-700">Active</span>
          </div>
        </div>
      </div>

      <div className="card p-6 bg-brand-50/50 border-brand-100">
        <p className="font-bold text-brand-800 mb-1.5">What you can do</p>
        <p className="text-sm text-brand-700/80 leading-relaxed">{ROLE_DESCRIPTIONS[user?.role]}</p>
      </div>
    </div>
  );
}
