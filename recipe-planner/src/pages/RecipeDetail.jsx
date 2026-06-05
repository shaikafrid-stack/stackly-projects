import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMealById } from '../utils/api';
import { useApp } from '../context/AppContext';
import { Loader, ErrorState } from '../components/States';
import { DAYS, MEAL_SLOTS } from '../utils/constants';

function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return match ? match[1] : null;
}

function getIngredients(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push({ ingredient: ingredient.trim(), measure: (measure || '').trim() });
    }
  }
  return ingredients;
}

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavourite, addFavourite, removeFavourite, addToPlan, state } = useApp();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [selectedSlot, setSelectedSlot] = useState(MEAL_SLOTS[0]);

  useEffect(() => {
    setLoading(true);
    getMealById(id)
      .then(data => { setMeal(data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [id]);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-12"><Loader /></div>;
  if (error || !meal) return <div className="max-w-4xl mx-auto px-4 py-12"><ErrorState message={error || 'Recipe not found'} onRetry={() => navigate(-1)} /></div>;

  const fav = isFavourite(meal.idMeal);
  const ingredients = getIngredients(meal);
  const ytId = getYouTubeId(meal.strYoutube);
  const tags = meal.strTags ? meal.strTags.split(',').map(t => t.trim()).filter(Boolean) : [];

  const handleAddToPlan = () => {
    addToPlan(selectedDay, selectedSlot, meal);
    setShowPlanModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 page-enter">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="btn-ghost text-sm mb-6">← Back</button>

      {/* Hero image + info */}
      <div className="card overflow-hidden mb-8">
        <div className="relative aspect-video sm:aspect-[3/1] overflow-hidden">
          <img src={meal.strMealThumb} alt={meal.strMeal} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <div className="flex flex-wrap gap-2 mb-2">
              {meal.strCategory && <span className="tag" style={{ background: 'var(--accent)', color: 'white' }}>{meal.strCategory}</span>}
              {meal.strArea && <span className="tag" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>🌍 {meal.strArea}</span>}
            </div>
            <h1 className="font-display text-white text-2xl sm:text-3xl font-bold">{meal.strMeal}</h1>
          </div>
        </div>
        <div className="p-4 flex flex-wrap gap-3">
          <button
            onClick={() => fav ? removeFavourite(meal.idMeal) : addFavourite(meal)}
            className={fav ? 'btn-primary' : 'btn-ghost'}
          >
            {fav ? '❤️ Saved' : '🤍 Save Favourite'}
          </button>
          <button onClick={() => setShowPlanModal(true)} className="btn-ghost">
            📅 Add to Meal Plan
          </button>
          {meal.strSource && (
            <a href={meal.strSource} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm">
              🔗 Source
            </a>
          )}
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map(tag => <span key={tag} className="tag"># {tag}</span>)}
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-8">
        {/* Ingredients */}
        <div>
          <h2 className="font-display text-xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
            🛒 Ingredients
          </h2>
          <ul className="space-y-2">
            {ingredients.map(({ ingredient, measure }, i) => (
              <li key={i} className="flex items-center gap-2 text-sm py-2"
                style={{ borderBottom: '1px solid var(--border)' }}>
                <img
                  src={`https://www.themealdb.com/images/ingredients/${encodeURIComponent(ingredient)}-Small.png`}
                  alt={ingredient}
                  className="w-8 h-8 object-contain rounded"
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <span style={{ color: 'var(--text)' }} className="font-medium flex-1">{ingredient}</span>
                {measure && <span style={{ color: 'var(--muted)' }} className="text-xs">{measure}</span>}
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="sm:col-span-2">
          <h2 className="font-display text-xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
            👨‍🍳 Instructions
          </h2>
          <div className="space-y-4">
            {meal.strInstructions?.split('\n').filter(s => s.trim()).map((step, i) => (
              <div key={i} className="flex gap-3 text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'var(--accent)', marginTop: 2 }}>
                  {i + 1}
                </span>
                <p>{step.trim()}</p>
              </div>
            ))}
          </div>

          {/* YouTube */}
          {ytId && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
                📺 Video Tutorial
              </h2>
              <div className="aspect-video rounded-xl overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}`}
                  title="Recipe Tutorial"
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Meal Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setShowPlanModal(false)}>
          <div className="card p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
              Add to Meal Plan
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
              Adding: <strong style={{ color: 'var(--text)' }}>{meal.strMeal}</strong>
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text)' }}>Day</label>
                <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)} className="input text-sm">
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text)' }}>Meal Slot</label>
                <select value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)} className="input text-sm">
                  {MEAL_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddToPlan} className="btn-primary flex-1">Add ✓</button>
              <button onClick={() => setShowPlanModal(false)} className="btn-ghost flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
