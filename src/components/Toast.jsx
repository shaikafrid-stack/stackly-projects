import { useEffect } from 'react';

const COLORS = {
  success: 'bg-emerald-900/90 border-emerald-500/50 text-emerald-100',
  error: 'bg-rose-900/90 border-rose-500/50 text-rose-100',
  info: 'bg-indigo-900/90 border-indigo-500/50 text-indigo-100',
};

const ICONS = { success: '✓', error: '✕', info: 'ℹ' };

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-2xl backdrop-blur-sm max-w-sm ${COLORS[toast.type] || COLORS.info}`}
      >
        <span className="text-base shrink-0">{ICONS[toast.type]}</span>
        <span className="flex-1">{toast.message}</span>
        <button
          onClick={onDismiss}
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity text-lg leading-none"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
