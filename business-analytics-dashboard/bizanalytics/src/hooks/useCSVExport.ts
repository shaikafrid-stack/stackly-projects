import { useCallback } from 'react';

export function useCSVExport() {
  const exportToCSV = useCallback(<T extends Record<string, unknown>>(
    data: T[], filename: string, columns?: { key: keyof T; label: string }[]
  ) => {
    if (!data.length) return;
    const keys = columns ? columns.map(c => c.key) : (Object.keys(data[0]) as (keyof T)[]);
    const headers = columns ? columns.map(c => c.label) : keys.map(k => String(k));
    const escape = (val: unknown): string => {
      const str = val == null ? '' : String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const rows = data.map(row => keys.map(k => escape(row[k])).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);
  return { exportToCSV };
}
