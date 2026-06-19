import { useState, useMemo, useCallback } from 'react';

export interface FilterConfig<T> { key: keyof T; value: string; }

export function useFilter<T extends Record<string, unknown>>(data: T[]) {
  const [filters, setFilters] = useState<FilterConfig<T>[]>([]);

  const filtered = useMemo(() => {
    if (!filters.length) return data;
    return data.filter(item =>
      filters.every(f => {
        if (f.value === 'All' || !f.value) return true;
        return String(item[f.key]) === f.value;
      })
    );
  }, [data, filters]);

  const setFilter = useCallback((key: keyof T, value: string) => {
    setFilters(prev => {
      const idx = prev.findIndex(f => f.key === key);
      if (idx >= 0) { const n = [...prev]; n[idx] = { key, value }; return n; }
      return [...prev, { key, value }];
    });
  }, []);

  const resetFilters = useCallback(() => setFilters([]), []);
  return { filters, filtered, setFilter, resetFilters };
}
