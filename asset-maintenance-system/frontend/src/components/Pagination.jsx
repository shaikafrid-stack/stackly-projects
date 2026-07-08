import React from 'react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button
        className="btn-secondary px-3 py-1.5"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        Prev
      </button>
      {pages.map((p, idx) => (
        <React.Fragment key={p}>
          {idx > 0 && p - pages[idx - 1] > 1 && <span className="px-1 text-gray-400">…</span>}
          <button
            onClick={() => onPageChange(p)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              p === page ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {p}
          </button>
        </React.Fragment>
      ))}
      <button
        className="btn-secondary px-3 py-1.5"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
