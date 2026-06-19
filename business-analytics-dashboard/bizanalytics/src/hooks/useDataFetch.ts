import { useState, useEffect, useCallback } from 'react';

interface FetchState<T> { data: T | null; loading: boolean; error: string | null; }

export function useDataFetch<T>(fetcher: () => Promise<T>) {
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: true, error: null });

  const run = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetcher();
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: err instanceof Error ? err.message : 'Unknown error' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { run(); }, [run]);
  return { ...state, refetch: run };
}
