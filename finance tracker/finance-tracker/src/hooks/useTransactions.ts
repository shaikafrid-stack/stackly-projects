import { useMemo, useState } from 'react';
import { Transaction, TransactionType, DateRange } from '../types';
import { getStartDate } from '../utils/dateHelpers';
import { ITEMS_PER_PAGE } from '../utils/constants';

interface Filters {
  search: string;
  category: string;
  type: TransactionType | 'all';
  dateRange: DateRange;
  sortBy: 'date' | 'amount';
  sortDir: 'asc' | 'desc';
}

export const useTransactions = (transactions: Transaction[]) => {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: 'all',
    type: 'all',
    dateRange: 'all',
    sortBy: 'date',
    sortDir: 'desc',
  });
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const startDate = getStartDate(filters.dateRange);
    return transactions
      .filter((t) => {
        if (
          filters.search &&
          !t.description.toLowerCase().includes(filters.search.toLowerCase())
        )
          return false;
        if (filters.category !== 'all' && t.category !== filters.category)
          return false;
        if (filters.type !== 'all' && t.type !== filters.type) return false;
        if (startDate && new Date(t.date) < startDate) return false;
        return true;
      })
      .sort((a, b) => {
        const dir = filters.sortDir === 'asc' ? 1 : -1;
        if (filters.sortBy === 'date') {
          return dir * (new Date(a.date).getTime() - new Date(b.date).getTime());
        }
        return dir * (a.amount - b.amount);
      });
  }, [transactions, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  return { filters, updateFilter, filtered, paginated, page, setPage, totalPages };
};
