import React from 'react';

const CATEGORIES = ['Travel', 'Food', 'Accommodation', 'Office Supplies', 'Client Entertainment', 'Software', 'Other'];

export default function FilterBar({ filters, setFilters }) {
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <input
        className="input-field max-w-xs"
        placeholder="Search by title..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
      />
      <select
        className="input-field max-w-[160px]"
        value={filters.status}
        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
      >
        <option value="">All Statuses</option>
        <option value="Pending">Pending</option>
        <option value="Approved">Approved</option>
        <option value="Rejected">Rejected</option>
      </select>
      <select
        className="input-field max-w-[180px]"
        value={filters.category}
        onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
      >
        <option value="">All Categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select
        className="input-field max-w-[180px]"
        value={filters.order}
        onChange={(e) => setFilters({ ...filters, order: e.target.value, page: 1 })}
      >
        <option value="desc">Date: Newest First</option>
        <option value="asc">Date: Oldest First</option>
      </select>
    </div>
  );
}
