import { useMemo } from 'react';
import { Transaction, MonthlySummary, CategorySummary } from '../types';
import {
  toYearMonth,
  getLast12Months,
  getLast6Months,
  getDayOfWeek,
} from '../utils/dateHelpers';
import { CHART_COLORS } from '../utils/constants';

export const useDerivedStats = (transactions: Transaction[]) => {
  return useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    const netBalance = income - expenses;
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    // Monthly summaries for last 12 months
    const last12 = getLast12Months();
    const monthlySummaries: MonthlySummary[] = last12.map((ym) => {
      const monthTxns = transactions.filter(
        (t) => toYearMonth(t.date) === ym
      );
      const inc = monthTxns
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0);
      const exp = monthTxns
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);
      return { month: ym, income: inc, expenses: exp, net: inc - exp };
    });

    const last6Summaries = monthlySummaries.slice(6);

    // Category breakdown
    const expenseTxns = transactions.filter((t) => t.type === 'expense');
    const totalExpenses = expenses;
    const categoryMap: Record<string, number> = {};
    expenseTxns.forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] ?? 0) + t.amount;
    });
    const categorySummaries: CategorySummary[] = Object.entries(categoryMap)
      .map(([cat, total]) => ({
        category: cat,
        total,
        percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .map((c, i) => ({ ...c, color: CHART_COLORS[i % CHART_COLORS.length] }));

    // Spent per category (current month)
    const currentMonth = toYearMonth(new Date().toISOString());
    const spentPerCategory: Record<string, number> = {};
    transactions
      .filter(
        (t) => t.type === 'expense' && toYearMonth(t.date) === currentMonth
      )
      .forEach((t) => {
        spentPerCategory[t.category] =
          (spentPerCategory[t.category] ?? 0) + t.amount;
      });

    // Highest spending day of week
    const dayTotals: Record<string, number> = {};
    expenseTxns.forEach((t) => {
      const day = getDayOfWeek(t.date);
      dayTotals[day] = (dayTotals[day] ?? 0) + t.amount;
    });
    const highestDay =
      Object.entries(dayTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';

    // Day of week chart data
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayChartData = daysOrder.map((day) => ({
      day: day.slice(0, 3),
      amount: dayTotals[day] ?? 0,
    }));

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netBalance,
      savingsRate,
      monthlySummaries,
      last6Summaries,
      categorySummaries,
      spentPerCategory,
      highestDay,
      dayChartData,
    };
  }, [transactions]);
};
