# FinFlow — Personal Finance Tracker & Analytics Dashboard

A fully TypeScript-based Personal Finance Tracker built with React, Recharts, React Hook Form + Zod, and Context API + useReducer.

## Tech Stack

- **React 18** + **TypeScript** (strict, no `any`)
- **Tailwind CSS** — custom dark theme
- **React Router DOM v6** — 6 pages
- **Context API + useReducer** — global state
- **Recharts** — LineChart, BarChart, PieChart/Donut
- **React Hook Form + Zod** — schema-driven validation
- **localStorage** — full persistence

## Getting Started

```bash
npm install
npm run dev
```

Build for production:
```bash
npm run build
```

## Project Structure

```
src/
  types/          → index.ts — all TypeScript interfaces & types
  context/        → AppContext.tsx, AppReducer.ts, initialState.ts
  hooks/          → useTransactions.ts, useBudget.ts, useDerivedStats.ts
  pages/          → Dashboard, Transactions, Budget, Analytics, Settings
  components/     → Navbar, TransactionForm, UI (shared components)
  utils/          → schema.ts, localStorage.ts, csvExport.ts,
                    formatCurrency.ts, dateHelpers.ts, constants.ts
```

## Features

### Dashboard
- Summary cards: Net Balance, Income, Expenses, Savings Rate
- Line chart: Income vs Expenses (last 6 months)
- Donut chart: Spending by category
- Recent transactions list
- Date range filter: Week / Month / Year / All

### Transactions
- Full table with search, filter (category, type, date range), sort (date/amount)
- Pagination (10/page)
- Add / Edit / Delete with modal form
- Zod-validated form with inline error messages

### Budget Goals
- Set monthly limits per category
- Progress bars with color indicators (green → yellow → red)
- Over-budget alert banner
- Add / Edit / Delete goals

### Analytics
- Bar chart: Monthly income vs expenses (12 months)
- Line chart: Net savings trend
- Bar chart: Spending by day of week
- Category breakdown table with budget comparison

### Settings
- Currency selector (INR / USD / EUR)
- Custom category management (add/remove)
- Export all transactions to CSV
- Clear all data with confirmation

## TypeScript Architecture

All types defined in `src/types/index.ts`. Key interfaces:

```typescript
type TransactionType = 'income' | 'expense';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: TransactionType;
  date: string;     // ISO string
  notes?: string;
  createdAt: string;
}

interface BudgetGoal {
  id: string;
  category: string;
  monthlyLimit: number;
  month: string;    // "YYYY-MM"
}
```

## Zod Validation

Defined in `src/utils/schema.ts`. Rules:
- Description: required, min 3 chars
- Amount: required, positive number
- Category: required selection
- Date: required, cannot be future
- Submit button disabled until form is valid
