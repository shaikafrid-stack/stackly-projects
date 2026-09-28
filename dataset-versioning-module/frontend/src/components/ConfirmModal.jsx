import React from 'react';

/**
 * Generic confirmation modal. Used directly for the "Restore Version
 * Confirmation" requirement, and reusable for any other destructive /
 * consequential action.
 */
export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  tone = 'primary',
  onConfirm,
  onCancel,
  loading = false,
  children,
}) {
  if (!open) return null;

  const confirmClass = tone === 'danger' ? 'btn-danger' : 'btn-primary';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
      <div className="card w-full max-w-md p-6 animate-in fade-in zoom-in-95">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {description && <p className="mt-2 text-sm text-slate-600">{description}</p>}
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className={confirmClass} onClick={onConfirm} disabled={loading}>
            {loading ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
