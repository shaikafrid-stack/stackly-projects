import { Activity, UserRole, ProjectStatus, ProjectPriority, ActivityStatus } from '../types';

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
};

export const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const getInitials = (name: string): string =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export const exportToCSV = (activities: Activity[], filename = 'activity-log'): void => {
  const headers = ['User', 'Action', 'Module', 'Description', 'Timestamp', 'Status'];
  const rows = activities.map(a => [
    a.userName, a.action, a.module, `"${a.description}"`,
    formatDateTime(a.timestamp), a.status,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const getRoleDashboardPath = (role: UserRole): string => {
  const paths: Record<UserRole, string> = {
    super_admin: '/dashboard',
    project_manager: '/dashboard',
    team_lead: '/dashboard',
    team_member: '/dashboard',
    viewer: '/dashboard',
  };
  return paths[role];
};

export const getStatusLabel = (status: ProjectStatus | ActivityStatus): string => {
  const labels: Record<string, string> = {
    active: 'Active', completed: 'Completed', on_hold: 'On Hold',
    cancelled: 'Cancelled', planning: 'Planning', success: 'Success',
    warning: 'Warning', error: 'Error',
  };
  return labels[status] ?? status;
};

export const getPriorityLabel = (priority: ProjectPriority): string => {
  const labels: Record<ProjectPriority, string> = {
    low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical',
  };
  return labels[priority];
};

export const getActionLabel = (action: string): string => {
  const labels: Record<string, string> = {
    created: 'Created', updated: 'Updated', deleted: 'Deleted',
    login: 'Login', logout: 'Logout', assigned: 'Assigned',
    completed: 'Completed', exported: 'Exported', deactivated: 'Deactivated',
    activated: 'Activated',
  };
  return labels[action] ?? action;
};

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function filterBySearch<T>(items: T[], query: string, fields: (keyof T)[]): T[] {
  if (!query.trim()) return items;
  const q = query.toLowerCase();
  return items.filter(item =>
    fields.some(field => {
      const val = item[field];
      return typeof val === 'string' && val.toLowerCase().includes(q);
    })
  );
}
