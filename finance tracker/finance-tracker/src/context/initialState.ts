import { AppState } from '../types';
import { DEFAULT_CATEGORIES } from '../utils/constants';

const now = new Date();
const d = (months: number, day: number) => {
  const dt = new Date(now.getFullYear(), now.getMonth() - months, day);
  return dt.toISOString();
};

export const initialState: AppState = {
  currency: 'INR',
  categories: [...DEFAULT_CATEGORIES],
  transactions: [
    { id: '1', description: 'Monthly Salary', amount: 75000, category: 'Salary', type: 'income', date: d(0, 1), notes: '', createdAt: d(0, 1) },
    { id: '2', description: 'Grocery Shopping', amount: 3200, category: 'Food & Dining', type: 'expense', date: d(0, 3), notes: '', createdAt: d(0, 3) },
    { id: '3', description: 'Netflix Subscription', amount: 649, category: 'Entertainment', type: 'expense', date: d(0, 5), notes: '', createdAt: d(0, 5) },
    { id: '4', description: 'Freelance Project', amount: 15000, category: 'Freelance', type: 'income', date: d(0, 8), notes: 'Web dev project', createdAt: d(0, 8) },
    { id: '5', description: 'Restaurant Dinner', amount: 1800, category: 'Food & Dining', type: 'expense', date: d(0, 10), notes: '', createdAt: d(0, 10) },
    { id: '6', description: 'Cab Rides', amount: 1200, category: 'Transport', type: 'expense', date: d(0, 12), notes: '', createdAt: d(0, 12) },
    { id: '7', description: 'Electricity Bill', amount: 2100, category: 'Utilities', type: 'expense', date: d(0, 15), notes: '', createdAt: d(0, 15) },
    { id: '8', description: 'Amazon Shopping', amount: 4500, category: 'Shopping', type: 'expense', date: d(0, 18), notes: '', createdAt: d(0, 18) },
    { id: '9', description: 'Monthly Salary', amount: 75000, category: 'Salary', type: 'income', date: d(1, 1), notes: '', createdAt: d(1, 1) },
    { id: '10', description: 'Grocery Shopping', amount: 2800, category: 'Food & Dining', type: 'expense', date: d(1, 4), notes: '', createdAt: d(1, 4) },
    { id: '11', description: 'Gym Membership', amount: 1500, category: 'Healthcare', type: 'expense', date: d(1, 6), notes: '', createdAt: d(1, 6) },
    { id: '12', description: 'Movie Tickets', amount: 800, category: 'Entertainment', type: 'expense', date: d(1, 9), notes: '', createdAt: d(1, 9) },
    { id: '13', description: 'Freelance Bonus', amount: 8000, category: 'Freelance', type: 'income', date: d(1, 14), notes: '', createdAt: d(1, 14) },
    { id: '14', description: 'Rent Payment', amount: 18000, category: 'Housing', type: 'expense', date: d(1, 1), notes: '', createdAt: d(1, 1) },
    { id: '15', description: 'Online Course', amount: 2999, category: 'Education', type: 'expense', date: d(1, 20), notes: 'React course', createdAt: d(1, 20) },
    { id: '16', description: 'Monthly Salary', amount: 75000, category: 'Salary', type: 'income', date: d(2, 1), notes: '', createdAt: d(2, 1) },
    { id: '17', description: 'Food Delivery', amount: 2200, category: 'Food & Dining', type: 'expense', date: d(2, 5), notes: '', createdAt: d(2, 5) },
    { id: '18', description: 'Petrol', amount: 3000, category: 'Transport', type: 'expense', date: d(2, 8), notes: '', createdAt: d(2, 8) },
    { id: '19', description: 'Rent Payment', amount: 18000, category: 'Housing', type: 'expense', date: d(2, 1), notes: '', createdAt: d(2, 1) },
    { id: '20', description: 'Investment Return', amount: 5000, category: 'Investments', type: 'income', date: d(2, 15), notes: '', createdAt: d(2, 15) },
    { id: '21', description: 'Monthly Salary', amount: 75000, category: 'Salary', type: 'income', date: d(3, 1), notes: '', createdAt: d(3, 1) },
    { id: '22', description: 'Doctor Visit', amount: 800, category: 'Healthcare', type: 'expense', date: d(3, 7), notes: '', createdAt: d(3, 7) },
    { id: '23', description: 'Rent Payment', amount: 18000, category: 'Housing', type: 'expense', date: d(3, 1), notes: '', createdAt: d(3, 1) },
    { id: '24', description: 'Clothes Shopping', amount: 6000, category: 'Shopping', type: 'expense', date: d(3, 12), notes: '', createdAt: d(3, 12) },
    { id: '25', description: 'Monthly Salary', amount: 75000, category: 'Salary', type: 'income', date: d(4, 1), notes: '', createdAt: d(4, 1) },
    { id: '26', description: 'Grocery Shopping', amount: 3500, category: 'Food & Dining', type: 'expense', date: d(4, 6), notes: '', createdAt: d(4, 6) },
    { id: '27', description: 'Rent Payment', amount: 18000, category: 'Housing', type: 'expense', date: d(4, 1), notes: '', createdAt: d(4, 1) },
    { id: '28', description: 'Internet Bill', amount: 999, category: 'Utilities', type: 'expense', date: d(4, 10), notes: '', createdAt: d(4, 10) },
    { id: '29', description: 'Monthly Salary', amount: 75000, category: 'Salary', type: 'income', date: d(5, 1), notes: '', createdAt: d(5, 1) },
    { id: '30', description: 'Rent Payment', amount: 18000, category: 'Housing', type: 'expense', date: d(5, 1), notes: '', createdAt: d(5, 1) },
  ],
  budgetGoals: [
    { id: 'b1', category: 'Food & Dining', monthlyLimit: 8000, month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` },
    { id: 'b2', category: 'Transport', monthlyLimit: 3000, month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` },
    { id: 'b3', category: 'Entertainment', monthlyLimit: 2000, month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` },
    { id: 'b4', category: 'Shopping', monthlyLimit: 5000, month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` },
    { id: 'b5', category: 'Utilities', monthlyLimit: 3000, month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` },
  ],
};
