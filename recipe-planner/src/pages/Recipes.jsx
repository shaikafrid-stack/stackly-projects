import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import RecipeCard from '../components/RecipeCard';
import Pagination from '../components/Pagination';
import { SkeletonGrid, EmptyState, ErrorState } from '../components/States';
import { searchByName, filterByCategory, filterByArea, getAreas } from '../utils/api';
import { usePagination } from '../hooks';
import { useApp } from '../context/AppContext';
import { RECIPES_PER_PAGE } from '../utils/constants';

export default function Recipes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, setCategory, setArea } = useApp();

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [areas, setAreas] = useState([]);

  const initialQuery = searchParams.get('q') || '';
  const initialCat = searchParams.get('c') || '';
  const [query, setQuery] = useState(initialQuery);

  const { page, totalPages, paginated, goTo } = usePagination(meals, RECIPES_PER_PAGE);

  const fetchMeals = useCallback(async (q, cat, area) => {
    setLoading(true);
    setError(null);
    try {
      let results = [];
      if (q) {
        results = await searchByName(q);
      } else if (cat) {
        results = await filterByCategory(cat);
      } else if (area) {
        results = await filterByArea(area);
      } else {
        results = await searchByName('');
      }
      setMeals(results);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const c = searchParams.get('c') || '';
    if (c) setCategory(c);
    setQuery(q);
    fetchMeals(q, c || state.activeCategory, state.activeArea);
  }, [searchParams]);

  useEffect(() => {
    getAreas().then(setAreas);
  }, []);

  const handleSearch = (q) => {
    setCategory('');
    setArea('');
    setSearchParams({ q });
  };

  const handleCategory = (cat) => {
    setArea('');
    setQuery('');
    if (cat) setSearchParams({ c: cat });
    else { setSearchParams({}); fetchMeals('', '', ''); }
  };

  const handleArea = (area) => {
    setArea(area);
    setCategory('');
    setQuery('');
    setSearchParams({});
    fetchMeals('', '', area);
  };

  const resultLabel = query
    ? `Results for "${query}"`
    : state.activeCategory
    ? `Category: ${state.activeCategory}`
    : state.activeArea
    ? `Cuisine: ${state.activeArea}`
    : 'All Recipes';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 page-enter space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>Recipes</h1>
        <p style={{ color: 'var(--muted)' }} className="text-sm">Search, filter, and explore thousands of dishes</p>
      </div>

      <SearchBar onSearch={handleSearch} initialValue={query} />

      <div className="flex flex-col gap-4">
        <CategoryFilter onSelect={handleCategory} />

        {areas.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            <select
              value={state.activeArea}
              onChange={e => handleArea(e.target.value)}
              className="input max-w-xs text-sm"
            >
              <option value="">🌍 All Cuisines</option>
              {areas.map(a => (
                <option key={a.strArea} value={a.strArea}>{a.strArea}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="font-display font-semibold" style={{ color: 'var(--text)' }}>
          {resultLabel}
          {!loading && <span className="ml-2 text-sm font-body font-normal" style={{ color: 'var(--muted)' }}>({meals.length} results)</span>}
        </p>
      </div>

      {loading && <SkeletonGrid />}
      {error && <ErrorState message={error} onRetry={() => fetchMeals(query, state.activeCategory, state.activeArea)} />}
      {!loading && !error && meals.length === 0 && (
        <EmptyState title="No recipes found" message="Try a different search or clear your filters." icon="🥘" />
      )}
      {!loading && !error && meals.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {paginated.map(meal => <RecipeCard key={meal.idMeal} meal={meal} />)}
          </div>
          <Pagination page={page} totalPages={totalPages} goTo={goTo} />
        </>
      )}
    </div>
  );
}
