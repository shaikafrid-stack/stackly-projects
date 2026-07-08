import React from 'react';

export default function Loading({ full = false, label = 'Loading...' }) {
  return (
    <div
      className={
        full
          ? 'min-h-screen flex flex-col items-center justify-center gap-3'
          : 'flex flex-col items-center justify-center gap-3 py-12'
      }
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
