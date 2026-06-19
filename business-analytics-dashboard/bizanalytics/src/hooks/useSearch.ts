import { useState, useMemo, useCallback } from 'react';

export function useSearch<T extends Record<string, unknown>>(
  data: T[],
  searchKeys: (keyof T)[]
) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(item =>
      searchKeys.some(key => {
        const val = item[key];
        return typeof val === 'string' && val.toLowerCase().includes(q);
      })
    );
  }, [data, search, searchKeys]);

  const handleSearch = useCallback((value: string) => setSearch(value), []);
  return { search, setSearch: handleSearch, filtered };
}
