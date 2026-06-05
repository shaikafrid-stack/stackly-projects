import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DAYS, MEAL_SLOTS } from '../utils/constants';

export default function MealPlanGrid({ onAddMeal }) {
  const { state, removeFromPlan } = useApp();
  const { mealPlan } = state;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" style={{ minWidth: 700 }}>
        <thead>
          <tr>
            <th className="p-3 text-left text-sm font-medium" style={{ color: 'var(--muted)', width: 110 }}>Day</th>
            {MEAL_SLOTS.map(slot => (
              <th key={slot} className="p-3 text-left text-sm font-semibold" style={{ color: 'var(--text)' }}>
                {slot === 'Breakfast' ? '🌅' : slot === 'Lunch' ? '☀️' : '🌙'} {slot}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day, di) => (
            <tr key={day} style={{ borderTop: '1px solid var(--border)', background: di % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)' }}>
              <td className="p-3">
                <span className="font-display font-semibold text-sm" style={{ color: 'var(--accent)' }}>{day}</span>
              </td>
              {MEAL_SLOTS.map(slot => {
                const meal = mealPlan?.[day]?.[slot];
                return (
                  <td key={slot} className="p-2">
                    {meal ? (
                      <div className="card p-2 flex items-center gap-2 group" style={{ borderRadius: 8 }}>
                        <img src={meal.strMealThumb} alt={meal.strMeal}
                          className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <Link to={`/recipes/${meal.idMeal}`}
                            className="text-xs font-medium leading-tight line-clamp-2 hover:underline"
                            style={{ color: 'var(--text)' }}>
                            {meal.strMeal}
                          </Link>
                        </div>
                        <button
                          onClick={() => removeFromPlan(day, slot)}
                          className="text-xs opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          style={{ color: 'var(--accent)' }}
                          title="Remove"
                        >✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onAddMeal(day, slot)}
                        className="w-full text-center py-2 px-3 rounded-lg text-xs transition-all"
                        style={{
                          border: '1.5px dashed var(--border)',
                          color: 'var(--muted)',
                        }}
                      >
                        + Add
                      </button>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
