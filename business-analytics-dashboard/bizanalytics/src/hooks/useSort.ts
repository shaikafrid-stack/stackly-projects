import { useState, useMemo, useCallback } from 'react';
import type { SortState } from '../types';

export function useSort<T extends Record<string, unknown>>(data: T[]) {
  const [sort, setSort] = useState<SortState<T>>({ key: null, direction: 'asc' });

  const sorted = useMemo(() => {
    if (!sort.key) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sort.key as keyof T];
      const bVal = b[sort.key as keyof T];
      let cmp = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') cmp = aVal.localeCompare(bVal);
      else if (typeof aVal === 'number' && typeof bVal === 'number') cmp = aVal - bVal;
      return sort.direction === 'asc' ? cmp : -cmp;
    });
  }, [data, sort]);

  const toggleSort = useCallback((key: keyof T) => {
    setSort(prev => prev.key === key
      ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      : { key, direction: 'asc' });
  }, []);

  return { sort, sorted, toggleSort };
}
