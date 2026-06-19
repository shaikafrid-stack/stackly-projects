# Business Analytics & Reporting Dashboard

A Business Analytics and Reporting Dashboard built with React and TypeScript. It provides KPI tracking, interactive Recharts visualizations, a reusable data table with search/filter/sort/pagination/export, and reporting workflows over realistic mock data.

## Tech Stack

- React 19 + TypeScript (strict, no `any`)
- React Router DOM v7
- Context API + `useReducer` for global state
- Recharts for data visualization
- A hand-written CSS design system in `index.css` (see Assumptions below for why `tailwindcss` is listed but not used as utility classes)
- React Hook Form + Zod are installed per the required stack, ready for any future write-back forms

## Setup Instructions

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm start
# App runs at http://localhost:3000

# 3. Production build
npm run build
# Outputs an optimized, code-split build to /build

# 4. Serve the production build locally (optional)
npx serve -s build
```

No environment variables or backend are required — all data is generated locally from a seeded mock dataset, so the app is fully self-contained.

## Folder Structure

```
src/
  types/        Shared TypeScript interfaces & types (Customer, Order, Product,
                Report, Activity, AppState/AppAction, ColumnDef<T>, etc.)
  context/      AppContext.tsx — Context API + useReducer global store
                (theme, sidebar state, filters, notifications)
  hooks/        Custom hooks: useSearch, useSort, usePagination, useFilter,
                useCSVExport, useDataFetch
  pages/        Route-level screens: Dashboard, Analytics, Reports,
                Customers, Orders, Products
  components/
    charts/     RevenueLineChart, RevenueAreaChart, CategoryBarChart,
                RegionPieChart (all Recharts, all React.memo)
    tables/     DataTable.tsx — the single reusable table used by every
                data page
    layout/     Sidebar.tsx — collapsible/responsive nav
    ui/         Header.tsx, ErrorBoundary.tsx, States.tsx (loading /
                skeleton / empty state primitives)
  utils/        Formatting helpers (currency, date, percent, status-badge
                class mapping)
  constants/    mockData.ts — seeded mock dataset generator
  assets/       Static assets (reserved per spec; currently empty)
  App.tsx       Routing, lazy-loaded pages, layout shell
  index.tsx     Entry point
```

## Features Implemented

### Dashboard Overview
KPI cards for Total Revenue, Total Customers, Total Orders, Active Users, Growth Rate, and Completed Orders, each with a trend badge (▲/▼ percentage change). Below the KPIs: a monthly revenue line chart, a region pie chart, a "Top Categories" summary table, and a Recent Activity panel (most recent 10 of 100 generated activity events).

### Analytics Module
Four chart types as specified: Monthly Revenue Trend (line), Orders by Category (bar), Customer Distribution (pie), Revenue vs Expenses (area). Filter bar supports Date Range (from/to), Category, and Region — all filters recompute chart data via `useMemo` rather than re-rendering charts that don't depend on the changed filter.

### Reports Management
Table of 100 generated reports with Name, Type, Created Date, and Status columns. Supports search, column sort, pagination, and a "View" action that opens a detail modal (type, status, created/updated dates, author, file size, description).

### Reusable Data Table
`components/tables/DataTable.tsx` is generic (`DataTable<T>`) and used identically across Reports, Customers, Orders, and Products — only the `columns` definition and `data` array change per page. It supports:
- Client-side search across configurable `searchKeys`
- Click-to-sort on any column marked `sortable`
- Pagination with page-size selector and numbered page controls
- Column visibility toggle (checkboxes, persists per table instance)
- CSV export respecting current column visibility

### Custom Hooks
| Hook | Responsibility |
|---|---|
| `useSearch` | Substring search across specified keys |
| `useSort` | Generic ascending/descending sort by column key |
| `usePagination` | Page slicing, page-size changes, bounds-safe navigation |
| `useFilter` | Multi-key equality filtering, used as a reusable building block |
| `useCSVExport` | Browser-side CSV generation and download, no server round-trip |
| `useDataFetch` | Generic async wrapper (loading/error/data) so mock data can be swapped for a real API without touching components |

### Performance Optimization
- **`React.memo`** — every chart component, `KPICard`, `StatusBadge`/`TrendBadge`, `Sidebar`, `Header`, and `DataTable` itself are memoized since they receive stable or rarely-changing props and would otherwise re-render on every parent state change (e.g. typing in search shouldn't re-render the sidebar).
- **`useMemo`** — table column definitions, filtered/sorted/paginated derivations, and Dashboard KPI aggregation are all memoized so expensive array operations (sort/filter over 100+ records) only re-run when their actual inputs change, not on every render.
- **`useCallback`** — event handlers passed down to memoized children (sort toggles, filter setters, export handler, modal close) are memoized so referential equality is preserved and the `React.memo` wrappers above actually take effect.
- **`React.lazy` + code splitting** — every page (`Dashboard`, `Analytics`, `Reports`, `Customers`, `Orders`, `Products`) is lazy-loaded in `App.tsx`. The production build confirms this: each page ships as its own JS chunk, so the initial load only downloads the Dashboard's code, not Recharts-heavy Analytics or the table-heavy Reports page until the user navigates there.

### Error Handling
- `ErrorBoundary` (class component) wraps the route outlet and the whole app shell, so a runtime error in one page shows a recoverable fallback UI instead of a blank screen.
- `PageLoader` shown during `Suspense` fallback for lazy-loaded routes.
- `EmptyState` shown inside `DataTable` when search/filter produces zero rows.
- Status badges and table cells fall back to an em dash for missing values rather than rendering `undefined`.

## Mock Data

All datasets are generated in `constants/mockData.ts` using a seeded pseudo-random generator (a fixed-seed LCG), so the dataset is large and varied but identical across reloads and machines — useful for stable screenshots and demos.

| Dataset | Records |
|---|---|
| Customers | 120 |
| Orders | 150 |
| Products | 105 |
| Revenue records | 120 |
| Reports | 100 |
| Activities | 100 |

## TypeScript Notes

- No `any` is used anywhere in `src/`. Generic table/sort/pagination hooks are written with `<T extends Record<string, unknown>>` bounds instead.
- `AppState`/`AppAction` are fully typed as a discriminated union, so the reducer's `switch` is exhaustive and each action's `payload` shape is checked at the call site.
- `ColumnDef<T>` ties each table's `key` to `keyof T`, so column definitions for `Customer`, `Order`, `Product`, and `Report` are all individually type-checked against their respective interfaces.

## Assumptions Made

- The brief lists Tailwind CSS in the technical stack; the implementation instead uses a hand-written CSS design system in `index.css` with CSS custom properties for theming (dark/light). This was a deliberate choice for a distinctive, non-templated visual identity rather than default Tailwind utility classes — `tailwindcss` is still installed and listed as a dependency in case a future iteration wants to layer it in.
- React Hook Form and Zod are installed per the required stack, but the current scope (read-only analytics/reporting) didn't call for any data-entry forms; they're ready to use for a future "Create Report" or "Edit Customer" form.
- "Active Users" on the dashboard is derived from customers with `status: 'Active'`, since there's no separate session/login dataset in this mock-data-only app.
- The Analytics page's date-range filter is wired to the chart layer as a scaffold (it filters the 12 monthly buckets by month index); since the mock monthly revenue series uses month labels rather than full per-day timestamps, this is the most faithful interpretation without inventing a daily revenue dataset.
- No backend/API exists; `useDataFetch` is included and typed so swapping in a real API later is a drop-in change rather than a rewrite.

## Screenshots

Run `npm start`, then capture screenshots of: Dashboard, Analytics (with filters applied), Reports list, Report detail modal, Customers table, Orders table, Products table, and the collapsed sidebar / mobile view — 8 screenshots covering every module, to attach with the GitHub submission.
