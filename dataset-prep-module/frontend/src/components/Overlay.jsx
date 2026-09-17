import React from 'react';
import { X, Inbox, Loader2, AlertTriangle } from 'lucide-react';

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  if (!open) return null;
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${widths[size]} card p-6 animate-fade-in max-h-[85vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 rounded-full p-1 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
        <div>{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', message, danger = false, confirmLabel = 'Confirm' }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>{confirmLabel}</button>
        </>
      }
    >
      <div className="flex gap-3 items-start">
        <div className={`rounded-full p-2 ${danger ? 'bg-rose-100 text-rose-600' : 'bg-brand-100 text-brand-600'}`}>
          <AlertTriangle size={20} />
        </div>
        <p className="text-sm text-slate-600">{message}</p>
      </div>
    </Modal>
  );
}

export function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="bg-brand-100 text-brand-600 rounded-2xl p-4 mb-4">
        <Icon size={28} />
      </div>
      <p className="font-semibold text-slate-700">{title}</p>
      {subtitle && <p className="text-sm text-slate-400 mt-1 max-w-sm">{subtitle}</p>}
    </div>
  );
}

export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-brand-600">
      <Loader2 className="animate-spin" size={32} />
      <p className="mt-3 text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="bg-rose-100 text-rose-600 rounded-2xl p-4 mb-4">
        <AlertTriangle size={28} />
      </div>
      <p className="font-semibold text-slate-700">{message}</p>
    </div>
  );
}
