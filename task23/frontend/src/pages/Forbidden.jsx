import React from 'react';
import { Link } from 'react-router-dom';

export default function Forbidden() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold text-slate-800 mb-2">403</h1>
      <p className="text-slate-500 mb-6">You don't have permission to access this page.</p>
      <Link to="/dashboard" className="btn-primary">
        Back to Dashboard
      </Link>
    </div>
  );
}
