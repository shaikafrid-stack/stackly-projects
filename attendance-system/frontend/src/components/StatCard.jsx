import React from 'react';

export default function StatCard({ label, value, icon: Icon, accent = 'primary' }) {
  const accentMap = {
    primary: 'text-primary-600 bg-primary-50 dark:bg-primary-900/20',
    green: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    red: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4">
      {Icon && (
        <div className={`p-3 rounded-lg ${accentMap[accent]}`}>
          <Icon size={22} />
        </div>
      )}
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
