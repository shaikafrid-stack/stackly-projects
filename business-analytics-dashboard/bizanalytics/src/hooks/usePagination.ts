import { useState, useMemo, useCallback, useEffect } from 'react';

export function usePagination<T>(data: T[], initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(data.length / pageSize)), [data.length, pageSize]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  const goToPage = useCallback((p: number) => {
    setPage(prev => {
      const maxP = Math.max(1, Math.ceil(data.length / pageSize));
      return Math.min(Math.max(1, p), maxP);
    });
  }, [data.length, pageSize]);

  const changePageSize = useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);

  // Reset to page 1 whenever the underlying dataset size changes (e.g. after
  // a search/filter narrows the rows) so the user isn't stranded on a page
  // that no longer exists.
  useEffect(() => { setPage(1); }, [data.length]);

  return { page, pageSize, totalPages, total: data.length, paginated, goToPage, changePageSize, hasNext: page < totalPages, hasPrev: page > 1 };
}
