import React, { ReactNode } from 'react';
import { X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { STATUS_COLORS, PRIORITY_COLORS, ROLE_COLORS, ROLE_LABELS, PAGE_SIZE_OPTIONS } from '../../constants';
import { UserRole, ProjectStatus, ProjectPriority, ActivityStatus, PaginationState } from '../../types';
import { getStatusLabel, getPriorityLabel } from '../../utils/helpers';

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps { label: string; className?: string; }
export const Badge: React.FC<BadgeProps> = ({ label, className }) => (
  <span className={`badge ${className ?? ''}`}>{label}</span>
);

export const StatusBadge: React.FC<{ status: ProjectStatus | ActivityStatus | 'active' | 'inactive' | 'pending' }> = ({ status }) => (
  <Badge label={getStatusLabel(status as ProjectStatus)} className={STATUS_COLORS[status as keyof typeof STATUS_COLORS] ?? ''} />
);

export const PriorityBadge: React.FC<{ priority: ProjectPriority }> = ({ priority }) => (
  <Badge label={getPriorityLabel(priority)} className={PRIORITY_COLORS[priority]} />
);

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => (
  <Badge label={ROLE_LABELS[role]} className={ROLE_COLORS[role]} />
);

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-teal-500', 'bg-orange-500',
  'bg-pink-500', 'bg-indigo-500', 'bg-green-500', 'bg-red-500',
];
const getAvatarColor = (name: string): string =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

interface AvatarProps { initials: string; name: string; size?: 'sm' | 'md' | 'lg'; }
export const Avatar: React.FC<AvatarProps> = ({ initials, name, size = 'md' }) => {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  return (
    <div className={`${sizes[size]} ${getAvatarColor(name)} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}>
      {initials}
    </div>
  );
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ size = 'md', className }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className={`${sizes[size]} border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin ${className ?? ''}`} />
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
interface EmptyStateProps { icon: ReactNode; title: string; description: string; action?: ReactNode; }
export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 mb-4">
      {icon}
    </div>
    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{title}</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{description}</p>
    {action}
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps { isOpen: boolean; onClose: () => void; title: string; children: ReactNode; size?: 'sm' | 'md' | 'lg'; }
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
interface ConfirmDialogProps {
  isOpen: boolean; onClose: () => void; onConfirm: () => void;
  title: string; message: string; confirmLabel?: string; variant?: 'danger' | 'warning';
}
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'danger',
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-2">{title}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Search Input ─────────────────────────────────────────────────────────────
interface SearchInputProps { value: string; onChange: (v: string) => void; placeholder?: string; }
export const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder = 'Search...' }) => (
  <div className="relative">
    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
    <input
      type="text" value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="input-field pl-9 w-64"
    />
  </div>
);

// ─── Pagination ───────────────────────────────────────────────────────────────
interface PaginationProps {
  pagination: PaginationState; totalPages: number;
  onPageChange: (p: number) => void; onPageSizeChange: (s: number) => void;
}
export const Pagination: React.FC<PaginationProps> = ({
  pagination, totalPages, onPageChange, onPageSizeChange,
}) => {
  const { page, pageSize, total } = pagination;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
        <span>{total === 0 ? '0 results' : `${start}–${end} of ${total}`}</span>
        <select
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
          className="input-field py-1 w-auto text-xs"
        >
          {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s} per page</option>)}
        </select>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)} disabled={page <= 1}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let pageNum: number;
          if (totalPages <= 5) pageNum = i + 1;
          else if (page <= 3) pageNum = i + 1;
          else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
          else pageNum = page - 2 + i;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 rounded text-sm transition-colors ${pageNum === page
                ? 'bg-blue-600 text-white font-medium'
                : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string; value: string | number; icon: ReactNode;
  trend?: { value: number; positive: boolean }; color?: string;
}
export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, color = 'blue' }) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend.positive ? 'text-green-600' : 'text-red-500'}`}>
            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
    </div>
  );
};

// ─── Form Field ───────────────────────────────────────────────────────────────
interface FormFieldProps {
  label: string; error?: string; required?: boolean;
  children: ReactNode; hint?: string;
}
export const FormField: React.FC<FormFieldProps> = ({ label, error, required, children, hint }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export const ProgressBar: React.FC<{ value: number; className?: string }> = ({ value, className }) => (
  <div className={`h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ${className ?? ''}`}>
    <div
      className="h-full bg-blue-500 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`bg-slate-200 dark:bg-slate-700 rounded animate-pulse ${className ?? ''}`} />
);

export const SkeletonCard: React.FC = () => (
  <div className="card p-5 space-y-3">
    <Skeleton className="h-10 w-10 rounded-xl" />
    <Skeleton className="h-7 w-16" />
    <Skeleton className="h-4 w-28" />
  </div>
);
