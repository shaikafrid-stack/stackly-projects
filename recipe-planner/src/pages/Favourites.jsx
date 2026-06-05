import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RecipeCard from '../components/RecipeCard';
import { EmptyState } from '../components/States';

export default function Favourites() {
  const { state, removeFavourite } = useApp();
  const { favourites } = state;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text)' }}>
            ❤️ My Favourites
          </h1>
          <p style={{ color: 'var(--muted)' }} className="text-sm mt-1">
            {favourites.length} recipe{favourites.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        {favourites.length > 0 && (
          <Link to="/recipes" className="btn-ghost text-sm">Browse More →</Link>
        )}
      </div>

      {favourites.length === 0 ? (
        <EmptyState
          icon="🤍"
          title="No favourites yet"
          message="Browse recipes and tap the heart icon to save your favourites here."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {favourites.map(meal => (
            <RecipeCard key={meal.idMeal} meal={meal} />
          ))}
        </div>
      )}
    </div>
  );
}
