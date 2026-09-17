import React from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

export function SummaryCard({ icon: Icon, label, value, gradient = 'from-brand-500 to-fuchsia-500' }) {
  return (
    <div className="card p-5 flex items-center gap-4 animate-fade-in">
      <div className={`bg-gradient-to-br ${gradient} text-white rounded-2xl p-3 shadow-glow shrink-0`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold text-slate-800 leading-tight">{value}</p>
        <p className="text-xs font-medium text-slate-400 mt-0.5 truncate">{label}</p>
      </div>
    </div>
  );
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-1 py-3">
      <p className="text-xs text-slate-400">Page {page} of {totalPages}</p>
      <div className="flex gap-1.5">
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="btn-ghost !px-2.5 !py-1.5 border border-slate-200 disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="btn-ghost !px-2.5 !py-1.5 border border-slate-200 disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export function SearchFilterBar({ search, onSearch, placeholder = 'Search...', children }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-4">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-10"
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <div className="flex gap-2 flex-wrap">{children}</div>
    </div>
  );
}

export function Select({ value, onChange, options, placeholder = 'All' }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="input !py-2.5 sm:!w-44">
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
