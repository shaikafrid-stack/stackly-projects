import { createContext, useContext, useReducer, useEffect } from 'react';
import { appReducer, initialState, ACTION } from './AppReducer';
import { loadState, saveState } from '../utils/localStorage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load persisted data on mount
  useEffect(() => {
    const persisted = {
      favourites: loadState('rp_favourites', []),
      mealPlan: loadState('rp_mealPlan', {}),
      theme: loadState('rp_theme', 'light'),
    };
    dispatch({ type: ACTION.LOAD_PERSISTED, payload: persisted });
  }, []);

  // Sync to localStorage on changes
  useEffect(() => {
    saveState('rp_favourites', state.favourites);
  }, [state.favourites]);

  useEffect(() => {
    saveState('rp_mealPlan', state.mealPlan);
  }, [state.mealPlan]);

  useEffect(() => {
    saveState('rp_theme', state.theme);
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  const addFavourite = (meal) => dispatch({ type: ACTION.ADD_FAVOURITE, payload: meal });
  const removeFavourite = (id) => dispatch({ type: ACTION.REMOVE_FAVOURITE, payload: id });
  const isFavourite = (id) => state.favourites.some(f => f.idMeal === id);

  const addToPlan = (day, slot, meal) =>
    dispatch({ type: ACTION.ADD_TO_PLAN, payload: { day, slot, meal } });
  const removeFromPlan = (day, slot) =>
    dispatch({ type: ACTION.REMOVE_FROM_PLAN, payload: { day, slot } });

  const setCategory = (cat) => dispatch({ type: ACTION.SET_CATEGORY, payload: cat });
  const setArea = (area) => dispatch({ type: ACTION.SET_AREA, payload: area });
  const toggleTheme = () => dispatch({ type: ACTION.TOGGLE_THEME });

  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      addFavourite,
      removeFavourite,
      isFavourite,
      addToPlan,
      removeFromPlan,
      setCategory,
      setArea,
      toggleTheme,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
