import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg p-6">
        <div className="card p-10 text-center max-w-md">
          <p className="text-2xl font-extrabold text-slate-800 mb-2">Access Restricted</p>
          <p className="text-slate-500 text-sm">Your role ({user.role.replace('_', ' ')}) does not have permission to view this page.</p>
        </div>
      </div>
    );
  }
  return children;
}
