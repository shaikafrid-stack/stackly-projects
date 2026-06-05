export const initialState = {
  favourites: [],
  mealPlan: {},   // { "Monday": { "Breakfast": meal, "Lunch": meal, ... }, ... }
  activeCategory: '',
  activeArea: '',
  theme: 'light',
};

export const ACTION = {
  ADD_FAVOURITE: 'ADD_FAVOURITE',
  REMOVE_FAVOURITE: 'REMOVE_FAVOURITE',
  ADD_TO_PLAN: 'ADD_TO_PLAN',
  REMOVE_FROM_PLAN: 'REMOVE_FROM_PLAN',
  SET_CATEGORY: 'SET_CATEGORY',
  SET_AREA: 'SET_AREA',
  TOGGLE_THEME: 'TOGGLE_THEME',
  LOAD_PERSISTED: 'LOAD_PERSISTED',
};

export function appReducer(state, action) {
  switch (action.type) {
    case ACTION.ADD_FAVOURITE:
      if (state.favourites.find(f => f.idMeal === action.payload.idMeal)) return state;
      return { ...state, favourites: [...state.favourites, action.payload] };

    case ACTION.REMOVE_FAVOURITE:
      return { ...state, favourites: state.favourites.filter(f => f.idMeal !== action.payload) };

    case ACTION.ADD_TO_PLAN: {
      const { day, slot, meal } = action.payload;
      return {
        ...state,
        mealPlan: {
          ...state.mealPlan,
          [day]: { ...(state.mealPlan[day] || {}), [slot]: meal }
        }
      };
    }

    case ACTION.REMOVE_FROM_PLAN: {
      const { day, slot } = action.payload;
      const dayPlan = { ...(state.mealPlan[day] || {}) };
      delete dayPlan[slot];
      return { ...state, mealPlan: { ...state.mealPlan, [day]: dayPlan } };
    }

    case ACTION.SET_CATEGORY:
      return { ...state, activeCategory: action.payload };

    case ACTION.SET_AREA:
      return { ...state, activeArea: action.payload };

    case ACTION.TOGGLE_THEME:
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };

    case ACTION.LOAD_PERSISTED:
      return { ...state, ...action.payload };

    default:
      return state;
  }
}
