import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, total, limit, onChange }) {
  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between px-1 py-3 text-sm text-ink-600">
        <span>{total} result{total !== 1 ? "s" : ""}</span>
      </div>
    );
  }

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <span className="text-sm text-ink-600">
        Showing <span className="font-semibold text-ink-900">{from}–{to}</span> of{" "}
        <span className="font-semibold text-ink-900">{total}</span>
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-lg border border-line hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="px-3 text-sm font-medium text-ink-900">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="p-2 rounded-lg border border-line hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
