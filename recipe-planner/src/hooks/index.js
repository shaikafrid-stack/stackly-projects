import { useState, useEffect } from 'react';

export function useMeals(fetchFn, deps = []) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchFn()
      .then(data => { if (!cancelled) { setMeals(data); setLoading(false); } })
      .catch(err => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
    // eslint-disable-next-line
  }, deps);

  return { meals, loading, error, setMeals };
}

export function usePagination(items, perPage) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(items.length / perPage);
  const paginated = items.slice((page - 1) * perPage, page * perPage);
  const goTo = (n) => setPage(Math.max(1, Math.min(n, totalPages)));
  useEffect(() => setPage(1), [items.length]);
  return { page, totalPages, paginated, goTo };
}

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : initial;
    } catch { return initial; }
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { /* ignore */ }
  }, [key, value]);

  return [value, setValue];
}

export function useFavourites() {
  const { state, addFavourite, removeFavourite, isFavourite } = require('../context/AppContext').useApp();
  return { favourites: state.favourites, addFavourite, removeFavourite, isFavourite };
}
