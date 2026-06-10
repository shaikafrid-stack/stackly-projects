import { z } from 'zod';

export const transactionSchema = z.object({
  description: z.string().min(3, 'Minimum 3 characters required'),
  amount: z
    .number({ invalid_type_error: 'Must be a number' })
    .positive('Must be a positive value'),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['income', 'expense']),
  date: z.string().refine((d) => new Date(d) <= new Date(), {
    message: 'Date cannot be in the future',
  }),
  notes: z.string().optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

export const budgetGoalSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  monthlyLimit: z
    .number({ invalid_type_error: 'Must be a number' })
    .positive('Must be a positive value'),
  month: z.string().min(1, 'Month is required'),
});

export type BudgetGoalFormData = z.infer<typeof budgetGoalSchema>;
