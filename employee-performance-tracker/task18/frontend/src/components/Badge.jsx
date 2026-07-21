import React from 'react';

const styles = {
  'Not Started': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
  'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
  Completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
  Low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
  High: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
};

export default function Badge({ children }) {
  const cls = styles[children] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{children}</span>
  );
}
