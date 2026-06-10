import React, { ReactNode } from 'react';

// StatCard
interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: 'default' | 'green' | 'red' | 'blue';
  icon?: ReactNode;
}
export const StatCard: React.FC<StatCardProps> = ({ label, value, sub, accent = 'default', icon }) => {
  const colors = {
    default: 'text-accent',
    green: 'text-accent-3',
    red: 'text-accent-2',
    blue: 'text-blue-400',
  };
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-start justify-between">
        <p className="text-xs text-muted font-medium uppercase tracking-wider">{label}</p>
        {icon && <span className={`${colors[accent]} opacity-70`}>{icon}</span>}
      </div>
      <p className={`text-2xl font-semibold mt-2 ${colors[accent]}`}>{value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  );
};

// ProgressBar
interface ProgressBarProps {
  value: number;
  max: number;
  isOver?: boolean;
}
export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, isOver }) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full bg-surface rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all ${isOver ? 'bg-accent-2' : pct > 80 ? 'bg-yellow-400' : 'bg-accent-3'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

// EmptyState
interface EmptyStateProps { message: string; }
export const EmptyState: React.FC<EmptyStateProps> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center mb-3">
      <span className="text-2xl">📭</span>
    </div>
    <p className="text-muted text-sm">{message}</p>
  </div>
);

// ConfirmDialog
interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4">
    <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-2xl">
      <p className="text-text text-sm mb-6">{message}</p>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2 rounded-lg border border-border text-sm text-muted hover:text-text">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2 rounded-lg bg-accent-2 text-white text-sm font-medium">Confirm</button>
      </div>
    </div>
  </div>
);

// Pagination
interface PaginationProps {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}
export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPage }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="px-3 py-1 rounded-lg text-sm text-muted hover:text-text disabled:opacity-30 border border-border"
      >←</button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`w-8 h-8 rounded-lg text-sm transition-colors ${p === page ? 'bg-accent text-white' : 'text-muted hover:text-text border border-border'}`}
        >{p}</button>
      ))}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1 rounded-lg text-sm text-muted hover:text-text disabled:opacity-30 border border-border"
      >→</button>
    </div>
  );
};

// Badge
interface BadgeProps { label: string; type: 'income' | 'expense'; }
export const Badge: React.FC<BadgeProps> = ({ label, type }) => (
  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${type === 'income' ? 'bg-accent-3/20 text-accent-3' : 'bg-accent-2/20 text-accent-2'}`}>
    {label}
  </span>
);

// PageHeader
interface PageHeaderProps { title: string; subtitle?: string; actions?: ReactNode; }
export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-2xl font-semibold text-text">{title}</h1>
      {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);
