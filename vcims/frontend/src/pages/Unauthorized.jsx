import React from 'react';
import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">403</h1>
        <p className="text-slate-500 mb-4">You don't have permission to access this page.</p>
        <Link to="/login" className="btn btn-primary">Back to Login</Link>
      </div>
    </div>
  );
}
