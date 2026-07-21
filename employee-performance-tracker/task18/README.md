# Employee Performance & Goal Tracking System

A full-stack web application for managing employee goals and performance
reviews, with role-based dashboards for Employees, Managers, and Admins.

**Stack:** React (Vite) + Tailwind CSS · Node.js/Express · MySQL

---

## 1. Project Structure

```
task18/
├── backend/                 # Node.js + Express API
│   ├── config/               # DB connection, schema.sql, seed script
│   ├── controllers/          # Route handlers (business logic)
│   ├── middleware/           # JWT auth, RBAC, validation
│   ├── routes/                # Express routers
│   └── server.js              # App entrypoint
└── frontend/                # React + Tailwind SPA
    └── src/
        ├── api/                # Axios client
        ├── context/            # Auth + Theme providers
        ├── components/         # Shared UI (Navbar, GoalTable, modals...)
        └── pages/               # employee/, manager/, admin/ route pages
```

---

## 2. Project Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL 8+ (or MariaDB 10.5+)

### Backend

```bash
cd backend
cp .env.example .env      # then edit .env with your MySQL credentials
npm install
npm run seed               # creates the DB tables' test users (see below)
npm run dev                 # starts the API on http://localhost:5000
```

> `npm run seed` only inserts users — you must create the schema first (see
> Database Configuration below) before seeding.

### Frontend

```bash
cd frontend
cp .env.example .env       # defaults to http://localhost:5000/api
npm install
npm run dev                 # starts the app on http://localhost:5173
```

Open http://localhost:5173 in your browser.

---

## 3. Database Configuration

1. Create the schema by running the SQL file against your MySQL server:

   ```bash
   mysql -u root -p < backend/config/schema.sql
   ```

   This creates the `performance_tracker` database and the `users`, `goals`,
   and `performance_reviews` tables with the appropriate foreign keys and
   constraints.

2. Set your credentials in `backend/.env`:

   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=performance_tracker
   JWT_SECRET=replace_this_with_a_long_random_secret
   ```

3. Seed test users:

   ```bash
   cd backend && npm run seed
   ```

---

## 4. Test User Credentials

| Role     | Email                  | Password       |
|----------|-------------------------|----------------|
| Admin    | admin@company.com       | Admin@123      |
| Manager  | manager@company.com     | Manager@123    |
| Employee | employee@company.com    | Employee@123   |
| Employee | sam@company.com         | Employee@123   |

The two seeded employees are assigned to the seeded manager, so manager and
admin dashboards will show real data right away.

---

## 5. API Endpoints

### Authentication
| Method | Endpoint            | Description                      |
|--------|-----------------------|-----------------------------------|
| POST   | `/api/register`        | Register (employee or manager)   |
| POST   | `/api/login`            | Log in, returns JWT + user        |
| GET    | `/api/profile`          | Get the logged-in user's profile |

### Goals
| Method | Endpoint            | Description                                              |
|--------|-----------------------|------------------------------------------------------------|
| GET    | `/api/goals`            | List goals (scoped by role) — supports `search`, `status`, `priority`, `sort`, `order`, `page`, `limit` |
| GET    | `/api/goals/:id`        | Get a single goal                                         |
| POST   | `/api/goals`             | Create a goal                                              |
| PUT    | `/api/goals/:id`         | Update a goal (fields allowed depend on role)              |
| DELETE | `/api/goals/:id`         | Delete a goal (manager/admin only)                          |

### Reviews
| Method | Endpoint            | Description                                     |
|--------|-----------------------|---------------------------------------------------|
| POST   | `/api/reviews`           | Submit a manager review or employee self-review  |
| GET    | `/api/reviews`            | List reviews (scoped by role)                     |
| PUT    | `/api/reviews/:id`        | Update a review                                     |

### Dashboards
| Method | Endpoint                     | Description                    |
|--------|---------------------------------|-----------------------------------|
| GET    | `/api/dashboard/employee`         | Employee's own dashboard metrics |
| GET    | `/api/dashboard/manager`           | Manager's team dashboard          |
| GET    | `/api/dashboard/admin`              | Org-wide dashboard (admin only)   |

### Users (Admin)
| Method | Endpoint            | Description                      |
|--------|-----------------------|------------------------------------|
| GET    | `/api/users`            | List/search/filter all users       |
| POST   | `/api/users`             | Create a user (any role)            |
| PUT    | `/api/users/:id`         | Update a user (role, manager, etc.) |
| DELETE | `/api/users/:id`         | Delete a user                        |
| GET    | `/api/users/my-team`      | Manager's own direct reports (used by the "assign goal" form) |

---

## 6. Features Implemented

- JWT authentication, protected routes, role-based navigation (Admin / Manager / Employee)
- Employee: create/view goals, update own progress %, submit self-review, view performance history
- Manager: assign goals to team members, review + rate completed goals, approve goals, team dashboard
- Admin: manage users (create/update role/delete), org-wide dashboard, department performance chart, CSV report export
- Search, status/priority filters, sortable columns, and pagination on all goal lists
- Client + server-side form validation, loading states, and error banners
- Responsive Tailwind UI with a light/dark theme toggle
- Toast notifications for all create/update/delete actions

### Bonus Features
- ✅ Performance charts (Recharts bar chart on the Admin dashboard)
- ✅ Export performance reports to CSV
- ✅ Toast Notifications (react-hot-toast)
- ✅ Dark/Light Theme toggle
- ⬜ Email notification simulation — not implemented in this build (goal creation could be wired to a mock email log easily as a follow-up)

---

## 7. Write-Up Questions

### 1. Relationships between `users`, `goals`, and `performance_reviews`

- `users` is self-referencing: each row has an optional `manager_id` FK
  pointing back to another row in `users`, modeling the employee → manager
  reporting line.
- `goals` has two FKs into `users`: `employee_id` (who the goal belongs to)
  and `manager_id` (who assigned/owns it). This is a **many-to-one**
  relationship in both directions — one employee can have many goals, and one
  manager can own many goals across their team.
- `performance_reviews` has a **one-to-one** relationship with `goals` via
  `goal_id` (enforced at the application layer — the API upserts a single
  review row per goal rather than allowing duplicates). Each review stores
  both `manager_comments` and `employee_comments` on the same row so a goal's
  full review (manager feedback + rating + self-reflection) lives together.

In short: `users (1) → (N) goals (1) → (1) performance_reviews`, with `users`
also self-joined for the management hierarchy.

### 2. Role-Based Access Control (RBAC) implementation

- On login, the server signs a JWT containing `{ id, role, name, email }`.
- An `authenticate` middleware verifies the token on every protected route
  and attaches the payload to `req.user`.
- An `authorize(...roles)` middleware wraps individual routes (e.g.
  `authorize('admin')` on `/api/dashboard/admin`) and rejects the request
  with a 403 if `req.user.role` isn't in the allowed list.
- Beyond route-level checks, controllers apply **row-level** scoping: e.g.
  `GET /api/goals` automatically filters by `employee_id = req.user.id` for
  employees and `manager_id = req.user.id` for managers, so even if two
  employees share a route, they can never see each other's data — only
  admins see everything.
- On the frontend, a `ProtectedRoute` component reads the logged-in user's
  role from `AuthContext` and redirects to `/unauthorized` (or `/login`) if
  the role doesn't match the route's `roles` prop. The Navbar also only
  renders links relevant to the current role.

### 3. Ensuring only the assigned employee can update goal progress

`PUT /api/goals/:id` first loads the target goal from the database, then
branches on `req.user.role`:

- If the caller is an **employee**, the handler checks
  `goal.employee_id !== req.user.id` and returns a 403 if they don't match —
  the employee ID being updated is never taken from the request body, only
  from the goal record fetched server-side, so a user can't spoof ownership
  by passing a different `employee_id` in the payload.
- Employees are further restricted to only mutate `progress_percentage` and
  `status` — they cannot change the title, priority, target date, or
  reassign the goal; those fields are silently ignored unless the caller is
  a manager or admin.
- This authorization is enforced entirely server-side (not just hidden in
  the UI), so even a direct API call with a valid but mismatched employee
  token is rejected.

### 4. Validations before a manager submits a performance review

Before `POST /api/reviews` persists a manager's review, the API checks:

- The goal exists and its `manager_id` matches the logged-in manager (403 if not — a manager cannot review another manager's team).
- The goal's `status` is `Completed` — reviews cannot be submitted against goals still in progress.
- `manager_comments` is present and at least 5 characters (prevents empty/placeholder feedback).
- `rating` is provided and falls within the 1–5 range (also enforced by a DB-level `CHECK` constraint as a second line of defense).

Employee self-reviews follow the analogous rule set: the goal must belong to
that employee, and `employee_comments` must meet the same minimum-length
check. If a review already exists for the goal, the endpoint updates it in
place instead of creating a duplicate row, keeping the one-to-one
goal↔review relationship intact.

### 5. Supporting quarterly and annual performance cycles

**Database changes:**
- Introduce a `review_cycles` table (`id`, `name` e.g. "Q3 2026", `type` ENUM('quarterly','annual'), `start_date`, `end_date`, `status`).
- Add a `cycle_id` FK to both `goals` and `performance_reviews`, so goals and their reviews are scoped to a specific cycle instead of existing indefinitely.
- Change the `performance_reviews` uniqueness assumption from "one review per goal" to "one review per (goal_id, cycle_id)" pair, since a long-running goal could now be reviewed at the end of each quarter as well as annually.
- Add a `cycle_summaries` (or materialized view) table per employee/cycle to store rolled-up ratings, useful for annual reviews that aggregate four quarterly ratings.

**Application/architecture changes:**
- Goal creation and dashboard queries would filter by "active cycle" by default, with historical cycles browsable via a cycle picker.
- Add a scheduled job (cron or a queue worker) to auto-close a cycle on its `end_date`, lock further edits to that cycle's reviews, and open the next one.
- Admin dashboard would aggregate metrics per cycle (e.g. quarter-over-quarter completion rate trends) rather than all-time totals only.
- Annual reviews would pull in and average/summarize the quarter's `performance_reviews` rows for that employee as a computed step, rather than being entered from scratch.
- API endpoints would gain a `cycle_id` query parameter (e.g. `GET /api/goals?cycle_id=3`), defaulting to the current open cycle if omitted, to keep existing frontend calls backward-compatible.

---

## 8. Screenshots & Demo Video

Add screenshots of the Login page, Employee/Manager/Admin dashboards, Goal
Management, Performance Review, and Reports dashboard to a `screenshots/`
folder before pushing to GitHub, and link your 5–7 minute demo video here.
