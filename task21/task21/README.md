# Data Source Configuration & Connection Management Module

A full-stack admin console for registering, validating, organizing, and monitoring
database connection profiles across environments — built for Task 21.

- **Frontend:** React 19 + Vite + Tailwind CSS + Recharts + React Router
- **Backend:** Node.js + Express + JWT authentication
- **Database:** SQL (SQLite for zero-config local dev; MySQL schema included for production)

---

## 1. Project Setup Instructions

### Prerequisites
- Node.js 18+ and npm

### Backend

```bash
cd backend
npm install
npm run seed     # creates the database and seeds demo users + data sources (auto-runs on first `npm start` too)
npm start         # starts the API on http://localhost:5000
```

The backend uses **SQLite** (`backend/data/datasource_manager.db`) by default so the whole
project runs with zero external services. The database, tables, and seed data are created
automatically the first time the server starts.

> **Driver note:** the backend uses Node's **built-in** `node:sqlite` module (no `npm install`
> compile step, no native bindings, no Visual Studio / Xcode build tools required). This
> requires **Node.js 22.5+** (you'll see a harmless `ExperimentalWarning: SQLite is an
> experimental feature` on startup — that's expected and safe to ignore). Check your version
> with `node -v`; if you're on an older Node, upgrade first.

### Frontend

```bash
cd frontend
npm install
npm run dev       # starts the app on http://localhost:5173
```

The frontend reads the API base URL from `frontend/.env` (`VITE_API_URL`), which already
points at `http://localhost:5000/api`.

### Production build

```bash
cd frontend
npm run build      # outputs static assets to frontend/dist
```

---

## 2. Database Configuration

### Local development (default) — SQLite
No setup needed. Schema is created automatically by `backend/config/db.js` on server start,
using the exact same table/column design as the production MySQL schema below.

### Production — MySQL
1. Run the provided schema against your MySQL server:
   ```bash
   mysql -u root -p < backend/db/schema.mysql.sql
   ```
2. Install the MySQL driver: `npm install mysql2` inside `backend/`.
3. Replace the SQLite connection in `backend/config/db.js` with a `mysql2` pool
   (a ready-to-use snippet and instructions are included as comments at the bottom of that file).
4. Set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `backend/.env` (see `.env.example`).

### Tables
| Table | Purpose |
|---|---|
| `users` | Application users with `ADMIN` / `ANALYST` roles (bcrypt-hashed passwords) |
| `data_sources` | Registered connection profiles (host, port, credentials, environment, status, category) |
| `connection_history` | Immutable audit log of every connection test run against a data source |

---

## 3. Test Credentials

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@datasource.io` | `Admin@123` |
| Data Analyst | `analyst@datasource.io` | `Analyst@123` |

(The login screen also has one-click buttons to autofill these.)

---

## 4. API Endpoints

All endpoints below (except `/api/login`) require an `Authorization: Bearer <token>` header.

### Authentication
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/login` | Public | Authenticate and receive a JWT |
| GET | `/api/profile` | Authenticated | Get the current user's profile |

### Data Sources
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/data-sources` | Admin, Analyst | List with `search`, `database_type`, `environment`, `status`, `category`, `page`, `limit`, `sortBy`, `sortDir` query params |
| GET | `/api/data-sources/:id` | Admin, Analyst | Get one data source |
| POST | `/api/data-sources` | **Admin only** | Create a data source |
| PUT | `/api/data-sources/:id` | **Admin only** | Update a data source |
| PATCH | `/api/data-sources/:id/status` | **Admin only** | Enable/disable a connection |
| DELETE | `/api/data-sources/:id` | **Admin only** | Delete a data source |
| POST | `/api/data-sources/:id/test` | **Admin only** | Run a simulated connection test |
| GET | `/api/data-sources/:id/history` | Admin, Analyst | Full connection history for one source |
| GET | `/api/data-sources/meta/categories` | Admin, Analyst | Distinct categories, for grouping UI |

### Dashboard
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/dashboard/admin` | **Admin only** | Summary cards + chart data + recent activity |
| GET | `/api/dashboard/analyst` | Admin, Analyst | Same read-only summary for analysts |

Passwords are never returned in plain text — the API masks stored passwords (e.g. `••••••••`)
in every response.

---

## 5. Folder Structure

```
task21/
├── backend/
│   ├── config/db.js               # SQLite connection + schema (MySQL notes included)
│   ├── db/
│   │   ├── schema.mysql.sql       # Production MySQL schema
│   │   └── seed.js                # Demo users + data sources + history seeder
│   ├── middleware/auth.js         # JWT authentication + role-based authorization
│   ├── routes/
│   │   ├── auth.js                # /api/login, /api/profile
│   │   ├── dataSources.js         # CRUD, test, history, filters
│   │   └── dashboard.js           # Analytics endpoints
│   ├── server.js                  # Express app entrypoint
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api/                   # axios instance + typed API calls
    │   ├── components/            # Reusable UI: Button, Modal, Badges, Sidebar,
    │   │                          #   AppLayout, Pagination, FormField, EmptyState…
    │   ├── context/AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx / Profile.jsx / Dashboard.jsx
    │   │   ├── admin/              # DataSourcesList, DataSourceForm, ConnectionHistory
    │   │   └── analyst/            # AvailableDataSources, ConnectionDetails, ActivityHistory
    │   └── App.jsx                 # Route table + role-based route guards
    └── .env.example
```

---

## 6. Write-Up Questions

**1. How did you design the relationship between Data Sources and Connection History?**
It's a one-to-many relationship: each `data_sources` row has many `connection_history`
rows, linked by `datasource_id` with `ON DELETE CASCADE` so history is cleaned up if a
source is removed. `data_sources` also keeps denormalized `last_tested_at` / `last_result`
columns for fast list/dashboard queries, while `connection_history` stays an
append-only audit log (every test, by whom, when, and the outcome) — so the summary
fields answer "what's the status now?" and the history table answers "what happened over time?".

**2. How did you implement role-based access control?**
JWTs are issued at login carrying `{ id, role, ... }`. An `authenticate` middleware
verifies the token on every protected route; a composable `authorize(...roles)`
middleware then checks the role before mutating routes (create/update/delete/test/status
are `authorize("ADMIN")`-only). On the frontend, `AuthContext` exposes `isAdmin`/`isAnalyst`,
`ProtectedRoute` guards each route by role and redirects unauthorized users, and the
sidebar renders a different navigation set per role — so Analysts never even see
create/edit/delete controls in the UI, and the API independently rejects those actions
if attempted directly.

**3. How did you simulate the connection testing functionality?**
`POST /api/data-sources/:id/test` doesn't open a real network connection. It generates a
weighted-random outcome (inactive sources are more likely to "fail" to feel realistic),
picks a matching remark ("Connection established successfully.", "Host unreachable.", etc.),
updates the source's `last_tested_at`/`last_result`, and inserts a new `connection_history`
row — giving the full UX (spinner, toast, updated badge, new history entry) without any
real database driver.

**4. Which React components were made reusable, and why?**
`Button`, `Modal`/`ConfirmDialog`, `Pagination`, `Badges` (`StatusPill`, `ResultPill`,
`EnvPill`, `DbTypeTag`), `FormField` (`Field`/`Input`/`Select`), `SummaryCard`,
`EmptyState`, `AppLayout`, and `Sidebar` are all shared across the Admin and Analyst
sections. They were pulled out because the same visual language (status pills, confirm
dialogs, paginated tables, form fields) repeats across list pages, forms, and detail
pages — centralizing them keeps styling, validation-error rendering, and accessibility
(focus states, ARIA labels) consistent everywhere instead of duplicated per page.

**5. How would you scale this to support more database types or cloud warehouses?**
`database_type` is a single enum-like column driving a small `DEFAULT_PORTS` lookup and a
color map on the frontend — adding "Databricks" or "Cosmos DB" is a one-line addition in
both places, no schema change needed. For genuinely different *connection shapes* (e.g. a
warehouse needing an account identifier + OAuth token instead of host/port/user/password),
the cleanest scale-out is to add a nullable `connection_config JSON` column to
`data_sources` for type-specific fields, keep the common fields as-is, and drive the Add/Edit
form from a small per-type field schema so the UI renders the right inputs without
branching logic scattered through the codebase. The simulated test endpoint would become
a pluggable `testers[database_type]` strategy so real drivers could be swapped in later
without touching the route or history logic.

---

## 7. Notes

- All list/search/filter operations are server-side (search, filters, sort, and
  pagination are handled by the API, not the client).
- Form validation runs both client-side (immediate feedback) and server-side
  (`express-validator`, authoritative).
- Toast notifications (via `react-hot-toast`) confirm every create/update/delete/test action.
- The UI is responsive down to mobile widths and uses visible focus rings for keyboard navigation.
