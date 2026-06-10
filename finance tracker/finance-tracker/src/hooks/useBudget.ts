import { useMemo } from 'react';
import { BudgetGoal, Transaction } from '../types';
import { toYearMonth } from '../utils/dateHelpers';

export interface BudgetStatus {
  goal: BudgetGoal;
  spent: number;
  remaining: number;
  percentage: number;
  isOver: boolean;
}

export const useBudget = (
  goals: BudgetGoal[],
  transactions: Transaction[]
): BudgetStatus[] => {
  return useMemo(() => {
    return goals.map((goal) => {
      const spent = transactions
        .filter(
          (t) =>
            t.type === 'expense' &&
            t.category === goal.category &&
            toYearMonth(t.date) === goal.month
        )
        .reduce((s, t) => s + t.amount, 0);

      const remaining = goal.monthlyLimit - spent;
      const percentage = (spent / goal.monthlyLimit) * 100;
      return {
        goal,
        spent,
        remaining,
        percentage,
        isOver: spent > goal.monthlyLimit,
      };
    });
  }, [goals, transactions]);
};
