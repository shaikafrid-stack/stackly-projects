import React from 'react';

export default function LoadingSpinner({ full = false, label = 'Loading...' }) {
  return (
    <div className={full ? 'min-h-screen flex items-center justify-center' : 'flex items-center justify-center py-10'}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <span className="text-sm text-slate-500">{label}</span>
      </div>
    </div>
  );
}
