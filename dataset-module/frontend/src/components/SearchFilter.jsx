import React from 'react';

export default function SearchFilter({ search, onSearchChange, status, onStatusChange, statusOptions = [] }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search datasets by name..."
        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        <option value="">All Statuses</option>
        {statusOptions.map((s) => (
          <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>
        ))}
      </select>
    </div>
  );
}
