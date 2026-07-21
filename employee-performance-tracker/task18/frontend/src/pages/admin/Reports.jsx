import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import GoalTable from '../../components/GoalTable';
import Spinner from '../../components/Spinner';
import ErrorBanner from '../../components/ErrorBanner';

function toCSV(rows) {
  const headers = ['ID', 'Title', 'Employee', 'Manager', 'Priority', 'Status', 'Progress %', 'Target Date'];
  const lines = [headers.join(',')];
  rows.forEach((g) => {
    const line = [
      g.id,
      `"${(g.title || '').replace(/"/g, '""')}"`,
      `"${g.employee_name || ''}"`,
      `"${g.manager_name || ''}"`,
      g.priority,
      g.status,
      g.progress_percentage,
      g.target_date,
    ].join(',');
    lines.push(line);
  });
  return lines.join('\n');
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function AdminReports() {
  const [goals, setGoals] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', sort: 'target_date', order: 'asc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchGoals = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/goals', { params: { ...filters, page, limit: 10 } });
      setGoals(data.data);
      setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchGoals(1); }, [fetchGoals]);

  const exportAll = async () => {
    setExporting(true);
    try {
      // Pull a large page to approximate "export all" for the current filters.
      const { data } = await api.get('/goals', { params: { ...filters, page: 1, limit: 1000 } });
      const csv = toCSV(data.data);
      downloadCSV(csv, `performance-report-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success('Report exported');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Organization Reports</h1>
        <button className="btn-primary" onClick={exportAll} disabled={exporting}>
          {exporting ? 'Exporting...' : '⬇ Export CSV'}
        </button>
      </div>

      {error && <ErrorBanner message={error} />}
      {loading ? (
        <Spinner label="Loading goals..." />
      ) : (
        <GoalTable
          goals={goals}
          showEmployee
          filters={filters}
          onFiltersChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
          pagination={pagination}
          onPageChange={(p) => fetchGoals(p)}
          onRowAction={(g) => <span className="text-xs text-gray-400">Manager: {g.manager_name}</span>}
        />
      )}
    </div>
  );
}
