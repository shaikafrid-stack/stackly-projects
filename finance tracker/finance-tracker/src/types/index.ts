export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: TransactionType;
  date: string; // ISO string
  notes?: string;
  createdAt: string;
}

export interface BudgetGoal {
  id: string;
  category: string;
  monthlyLimit: number;
  month: string; // "YYYY-MM"
}

export interface AppState {
  transactions: Transaction[];
  budgetGoals: BudgetGoal[];
  categories: string[];
  currency: string;
}

export type DateRange = 'week' | 'month' | 'year' | 'all';

export interface ActiveFilters {
  dateRange: DateRange;
  category: string;
  type: TransactionType | 'all';
  search: string;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface CategorySummary {
  category: string;
  total: number;
  percentage: number;
  budget?: number;
}

export type AppAction =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_BUDGET_GOAL'; payload: BudgetGoal }
  | { type: 'UPDATE_BUDGET_GOAL'; payload: BudgetGoal }
  | { type: 'DELETE_BUDGET_GOAL'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: string }
  | { type: 'REMOVE_CATEGORY'; payload: string }
  | { type: 'SET_CURRENCY'; payload: string }
  | { type: 'CLEAR_ALL_DATA' }
  | { type: 'LOAD_STATE'; payload: AppState };
