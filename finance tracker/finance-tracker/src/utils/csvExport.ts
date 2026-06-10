import { Transaction } from '../types';
import { formatDate } from './dateHelpers';

export const exportToCSV = (transactions: Transaction[], currency: string): void => {
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Notes'];
  const rows = transactions.map((t) => [
    formatDate(t.date),
    `"${t.description.replace(/"/g, '""')}"`,
    t.category,
    t.type,
    `${currency} ${t.amount.toFixed(2)}`,
    `"${(t.notes ?? '').replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `finflow_transactions_${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
