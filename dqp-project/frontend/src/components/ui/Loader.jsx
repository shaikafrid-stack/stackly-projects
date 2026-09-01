import React from 'react';

export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <div className="h-8 w-8 border-2 border-slate-300 border-t-brand-500 rounded-full animate-spin mb-3" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
