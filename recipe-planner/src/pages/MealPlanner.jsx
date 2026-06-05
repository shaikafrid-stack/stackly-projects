import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MealPlanGrid from '../components/MealPlanGrid';
import SearchBar from '../components/SearchBar';
import RecipeCard from '../components/RecipeCard';
import { EmptyState, SkeletonGrid } from '../components/States';
import { useApp } from '../context/AppContext';
import { searchByName, filterByCategory } from '../utils/api';
import { DAYS, MEAL_SLOTS } from '../utils/constants';

export default function MealPlanner() {
  const { state, addToPlan, removeFromPlan } = useApp();
  const [modal, setModal] = useState(null); // { day, slot }
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const totalMeals = Object.values(state.mealPlan).reduce((acc, day) => acc + Object.keys(day).length, 0);

  const openAddModal = (day, slot) => {
    setModal({ day, slot });
    setSearchResults([]);
    setSearched(false);
  };

  const handleSearch = async (q) => {
    setSearching(true);
    const results = await searchByName(q);
    setSearchResults(results.slice(0, 12));
    setSearching(false);
    setSearched(true);
  };

  const assignMeal = (meal) => {
    if (!modal) return;
    addToPlan(modal.day, modal.slot, meal);
    setModal(null);
  };

  const clearPlan = () => {
    if (window.confirm('Clear the entire meal plan?')) {
      DAYS.forEach(day => MEAL_SLOTS.forEach(slot => removeFromPlan(day, slot)));
    }
  };

  const printPlan = () => window.print();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 page-enter">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text)' }}>
            📅 Weekly Meal Planner
          </h1>
          <p style={{ color: 'var(--muted)' }} className="text-sm mt-1">
            {totalMeals} meal{totalMeals !== 1 ? 's' : ''} planned this week
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={printPlan} className="btn-ghost text-sm">🖨️ Print</button>
          {totalMeals > 0 && <button onClick={clearPlan} className="btn-ghost text-sm" style={{ color: 'var(--accent)' }}>🗑️ Clear All</button>}
        </div>
      </div>

      <div className="card p-4 sm:p-6">
        <MealPlanGrid onAddMeal={openAddModal} />
      </div>

      {totalMeals === 0 && (
        <div className="mt-4">
          <EmptyState icon="🗓️" title="Your week is empty" message='Click "+ Add" in any slot to start planning your meals.' />
        </div>
      )}

      {/* Ingredients summary */}
      {totalMeals > 0 && (
        <div className="card p-4 mt-4">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            <strong style={{ color: 'var(--text)' }}>💡 Tip:</strong> Click any meal name in the planner to view its full recipe and ingredient list.
          </p>
        </div>
      )}

      {/* Add Meal Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setModal(null)}>
          <div className="card p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-xl font-semibold" style={{ color: 'var(--text)' }}>
                  Add Meal
                </h3>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  {modal.day} — {modal.slot}
                </p>
              </div>
              <button onClick={() => setModal(null)} className="text-2xl" style={{ color: 'var(--muted)' }}>✕</button>
            </div>

            <SearchBar onSearch={handleSearch} placeholder="Search for a recipe..." />

            <div className="mt-4">
              {searching && <div className="text-center py-8"><span className="text-2xl animate-bounce">🍳</span></div>}
              {searched && searchResults.length === 0 && (
                <EmptyState icon="🤷" title="No results" message="Try a different keyword." />
              )}
              {searchResults.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {searchResults.map(meal => (
                    <button key={meal.idMeal} onClick={() => assignMeal(meal)}
                      className="card text-left hover:border-orange-400 transition-colors">
                      <img src={meal.strMealThumb} alt={meal.strMeal} className="w-full aspect-video object-cover" />
                      <p className="p-2 text-xs font-medium leading-tight" style={{ color: 'var(--text)' }}>
                        {meal.strMeal}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {!searched && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-3" style={{ color: 'var(--muted)' }}>Or pick from your favourites:</p>
                  {state.favourites.length === 0 ? (
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>No favourites saved yet. Search above!</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {state.favourites.map(meal => (
                        <button key={meal.idMeal} onClick={() => assignMeal(meal)}
                          className="card text-left hover:border-orange-400 transition-colors">
                          <img src={meal.strMealThumb} alt={meal.strMeal} className="w-full aspect-video object-cover" />
                          <p className="p-2 text-xs font-medium leading-tight" style={{ color: 'var(--text)' }}>
                            {meal.strMeal}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
