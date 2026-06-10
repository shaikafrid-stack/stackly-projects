import { AppState, AppAction } from '../types';
import { DEFAULT_CATEGORIES } from '../utils/constants';

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...action.payload };

    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };

    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };

    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };

    case 'ADD_BUDGET_GOAL':
      return { ...state, budgetGoals: [...state.budgetGoals, action.payload] };

    case 'UPDATE_BUDGET_GOAL':
      return {
        ...state,
        budgetGoals: state.budgetGoals.map((b) =>
          b.id === action.payload.id ? action.payload : b
        ),
      };

    case 'DELETE_BUDGET_GOAL':
      return {
        ...state,
        budgetGoals: state.budgetGoals.filter((b) => b.id !== action.payload),
      };

    case 'ADD_CATEGORY':
      if (state.categories.includes(action.payload)) return state;
      return { ...state, categories: [...state.categories, action.payload] };

    case 'REMOVE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter((c) => c !== action.payload),
      };

    case 'SET_CURRENCY':
      return { ...state, currency: action.payload };

    case 'CLEAR_ALL_DATA':
      return {
        transactions: [],
        budgetGoals: [],
        categories: [...DEFAULT_CATEGORIES],
        currency: 'INR',
      };

    default:
      return state;
  }
};
