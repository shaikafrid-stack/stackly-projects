import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function RecipeCard({ meal, showAddToPlan = false }) {
  const { isFavourite, addFavourite, removeFavourite } = useApp();
  const fav = isFavourite(meal.idMeal);

  const toggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    fav ? removeFavourite(meal.idMeal) : addFavourite(meal);
  };

  return (
    <Link to={`/recipes/${meal.idMeal}`} className="card group block">
      <div className="relative overflow-hidden aspect-video">
        <img
          src={meal.strMealThumb}
          alt={meal.strMeal}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <button
          onClick={toggle}
          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{
            background: fav ? 'var(--accent)' : 'rgba(255,255,255,0.9)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
          title={fav ? 'Remove from favourites' : 'Add to favourites'}
        >
          <span className="text-sm">{fav ? '❤️' : '🤍'}</span>
        </button>
        {meal.strCategory && (
          <span className="absolute bottom-2 left-2 tag" style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}>
            {meal.strCategory}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-display font-semibold text-sm leading-tight line-clamp-2 mb-1" style={{ color: 'var(--text)' }}>
          {meal.strMeal}
        </h3>
        {meal.strArea && (
          <p className="text-xs" style={{ color: 'var(--muted)' }}>🌍 {meal.strArea} cuisine</p>
        )}
      </div>
    </Link>
  );
}
