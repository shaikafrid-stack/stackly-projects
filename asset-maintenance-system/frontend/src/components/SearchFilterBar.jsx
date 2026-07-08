import React from 'react';

export default function SearchFilterBar({
  search,
  onSearchChange,
  statusOptions,
  status,
  onStatusChange,
  priorityOptions,
  priority,
  onPriorityChange,
  placeholder = 'Search...',
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <input
        type="text"
        className="input sm:max-w-xs"
        placeholder={placeholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      {statusOptions && (
        <select className="input sm:max-w-[180px]" value={status} onChange={(e) => onStatusChange(e.target.value)}>
          <option value="">All Statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}
      {priorityOptions && (
        <select
          className="input sm:max-w-[180px]"
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
        >
          <option value="">All Priorities</option>
          {priorityOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
