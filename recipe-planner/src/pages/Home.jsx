import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import RecipeCard from '../components/RecipeCard';
import { SkeletonGrid } from '../components/States';
import { getRandomMeals, getCategories } from '../utils/api';
import { useApp } from '../context/AppContext';

export default function Home() {
  const navigate = useNavigate();
  const { setCategory } = useApp();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    Promise.all([getRandomMeals(8), getCategories()]).then(([meals, cats]) => {
      setFeatured(meals);
      setCategories(cats.slice(0, 12));
      setLoading(false);
    });
  }, []);

  const handleSearch = (q) => navigate(`/recipes?q=${encodeURIComponent(q)}`);
  const handleCategory = (cat) => {
    if (cat) navigate(`/recipes?c=${encodeURIComponent(cat)}`);
  };

  return (
    <div className="page-enter">
      {/* Hero */}
      <section
        className="relative py-20 px-4 text-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--bg) 100%)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, var(--accent) 0, var(--accent) 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
        <div className="relative max-w-2xl mx-auto">
          <p className="text-sm font-medium tracking-widest uppercase mb-3" style={{ color: 'var(--accent)' }}>
            Your Personal Kitchen Companion
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4" style={{ color: 'var(--text)' }}>
            Discover & Plan<br />
            <em style={{ color: 'var(--accent)' }}>Delicious Meals</em>
          </h1>
          <p className="mb-8 text-lg" style={{ color: 'var(--muted)' }}>
            Search thousands of recipes, save your favourites, and plan your whole week.
          </p>
          <SearchBar onSearch={handleSearch} placeholder="What do you feel like eating?" />

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link to="/recipes" className="btn-ghost text-sm">Browse All Recipes →</Link>
            <Link to="/favourites" className="btn-ghost text-sm">❤️ My Favourites</Link>
            <Link to="/planner" className="btn-ghost text-sm">📅 Meal Planner</Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Category Filter */}
        <section>
          <h2 className="font-display text-2xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Browse by Category
          </h2>
          <CategoryFilter onSelect={handleCategory} />
        </section>

        {/* Featured Recipes */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-semibold" style={{ color: 'var(--text)' }}>
              ✨ Featured Today
            </h2>
            <Link to="/recipes" className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
              View all →
            </Link>
          </div>
          {loading ? <SkeletonGrid count={8} /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {featured.map(meal => <RecipeCard key={meal.idMeal} meal={meal} />)}
            </div>
          )}
        </section>

        {/* Category Cards */}
        {categories.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
              🗂️ All Categories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.map(cat => (
                <button
                  key={cat.idCategory}
                  onClick={() => navigate(`/recipes?c=${encodeURIComponent(cat.strCategory)}`)}
                  className="card p-3 text-center hover:border-orange-400 transition-colors"
                >
                  <img src={cat.strCategoryThumb} alt={cat.strCategory}
                    className="w-12 h-12 rounded-full mx-auto mb-2 object-cover" />
                  <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{cat.strCategory}</p>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
