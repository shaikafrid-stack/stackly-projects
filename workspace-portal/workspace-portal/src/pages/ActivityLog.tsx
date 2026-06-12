import React, { useState, useMemo } from 'react';
import { Download, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { usePermissions, usePagination, useSearch } from '../hooks';
import { ActivityAction, ActivityModule, ActivityStatus } from '../types';
import {
  StatusBadge, Avatar, Pagination, SearchInput, EmptyState,
} from '../components/ui';
import { formatDateTime, getActionLabel, exportToCSV } from '../utils/helpers';
import { STATUS_COLORS } from '../constants';
import toast from 'react-hot-toast';

const ACTION_COLORS: Record<string, string> = {
  created: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  updated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  deleted: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  login: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  logout: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  assigned: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  completed: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  exported: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  deactivated: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  activated: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};

const ActivityLog: React.FC = () => {
  const { state: appState, logActivity } = useApp();
  const { state: authState } = useAuth();
  const perms = usePermissions();
  const user = authState.user!;

  const [actionFilter, setActionFilter] = useState<ActivityAction | 'all'>('all');
  const [moduleFilter, setModuleFilter] = useState<ActivityModule | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | 'all'>('all');

  const { query, setQuery, filtered: searchFiltered } = useSearch(
    appState.activities, ['userName', 'description', 'module']
  );

  const filtered = useMemo(() => {
    let result = searchFiltered;
    if (actionFilter !== 'all') result = result.filter(a => a.action === actionFilter);
    if (moduleFilter !== 'all') result = result.filter(a => a.module === moduleFilter);
    if (statusFilter !== 'all') result = result.filter(a => a.status === statusFilter);
    return result;
  }, [searchFiltered, actionFilter, moduleFilter, statusFilter]);

  const { paginatedItems, pagination, totalPages, setPage, setPageSize } = usePagination(filtered);

  const handleExport = () => {
    exportToCSV(filtered);
    logActivity({
      userId: user.id, userName: user.name, action: 'exported', module: 'activity',
      description: 'Exported activity log to CSV', timestamp: new Date().toISOString(), status: 'success',
    });
    toast.success('Activity log exported to CSV');
  };

  const actions: ActivityAction[] = ['created', 'updated', 'deleted', 'login', 'logout', 'assigned', 'completed', 'exported', 'deactivated', 'activated'];
  const modules: ActivityModule[] = ['auth', 'users', 'projects', 'activity', 'dashboard', 'settings'];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <SearchInput value={query} onChange={setQuery} placeholder="Search activity…" />
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-slate-400" />
            <select value={actionFilter} onChange={e => setActionFilter(e.target.value as ActivityAction | 'all')} className="input-field py-2 text-xs w-auto">
              <option value="all">All Actions</option>
              {actions.map(a => <option key={a} value={a}>{getActionLabel(a)}</option>)}
            </select>
            <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value as ActivityModule | 'all')} className="input-field py-2 text-xs w-auto">
              <option value="all">All Modules</option>
              {modules.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ActivityStatus | 'all')} className="input-field py-2 text-xs w-auto">
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
        {perms.canExportActivity && (
          <button className="btn-secondary shrink-0" onClick={handleExport}>
            <Download size={15} />Export CSV
          </button>
        )}
      </div>

      {/* Summary pills */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-slate-500 dark:text-slate-400">{filtered.length} events</span>
        <span className="text-green-500 font-medium">{filtered.filter(a => a.status === 'success').length} success</span>
        <span className="text-yellow-500 font-medium">{filtered.filter(a => a.status === 'warning').length} warning</span>
        <span className="text-red-500 font-medium">{filtered.filter(a => a.status === 'error').length} error</span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="table-header">User</th>
                <th className="table-header">Action</th>
                <th className="table-header hidden md:table-cell">Module</th>
                <th className="table-header hidden sm:table-cell">Description</th>
                <th className="table-header">Timestamp</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map(activity => (
                <tr key={activity.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        initials={activity.userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        name={activity.userName} size="sm"
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">{activity.userName}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${ACTION_COLORS[activity.action] ?? 'bg-slate-100 text-slate-600'}`}>
                      {getActionLabel(activity.action)}
                    </span>
                  </td>
                  <td className="table-cell hidden md:table-cell">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded font-mono">
                      {activity.module}
                    </span>
                  </td>
                  <td className="table-cell hidden sm:table-cell">
                    <span className="text-slate-500 dark:text-slate-400 text-xs">{activity.description}</span>
                  </td>
                  <td className="table-cell whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs font-mono">
                    {formatDateTime(activity.timestamp)}
                  </td>
                  <td className="table-cell">
                    <StatusBadge status={activity.status} />
                  </td>
                </tr>
              ))}
              {paginatedItems.length === 0 && (
                <tr><td colSpan={6} className="py-12">
                  <EmptyState icon={<Filter size={24} />} title="No activity found" description="Try adjusting your search or filter criteria." />
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          pagination={pagination} totalPages={totalPages}
          onPageChange={setPage} onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
};

export default ActivityLog;
