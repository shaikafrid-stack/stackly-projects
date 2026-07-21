import React from 'react';

export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
      {message}
    </div>
  );
}
