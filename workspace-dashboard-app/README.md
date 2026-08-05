# Workspace & Dashboard Management Module

Full-stack app: **React + Tailwind CSS** frontend, **Node.js / Express** backend, **MySQL** database.

---

## 1. Project Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL 8+ (MySQL Workbench is fine for running the schema)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your MySQL Workbench credentials (see section 2)
```

Create the database: open **MySQL Workbench**, connect to your local server, open
`backend/db/schema.sql` and execute it (lightning bolt icon). This drops/creates
`workspace_dashboard_db` and all 5 tables.

Seed demo data (users, a workspace, members, dashboards):

```bash
npm run seed
```

Start the API:

```bash
npm run dev      # nodemon, auto-restart
# or
npm start
```

API runs at `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173` and proxies `/api` requests to `http://localhost:5000`
(see `frontend/vite.config.js`).

---

## 2. Database Configuration (MySQL Workbench)

1. Open MySQL Workbench, connect to your local instance.
2. Run `backend/db/schema.sql` as a script (File → Open SQL Script → Run).
3. Copy `backend/.env.example` to `backend/.env` and fill in:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<your MySQL Workbench root/user password>
DB_NAME=workspace_dashboard_db
JWT_SECRET=<any long random string>
```

4. Run `npm run seed` from `backend/` to populate demo users/workspace/dashboards.

---

## 3. API Endpoints

**Auth**
- `POST /api/login`
- `GET /api/profile`
- `PUT /api/profile`

**Workspaces**
- `GET /api/workspaces` (search, status, page, limit query params)
- `GET /api/workspaces/:id`
- `POST /api/workspaces` (Administrator)
- `PUT /api/workspaces/:id` (Administrator)
- `DELETE /api/workspaces/:id` (Administrator)
- `PATCH /api/workspaces/:id/status` (Administrator - activate/deactivate)
- `POST /api/workspaces/:id/assign-manager` (Administrator)

**Members**
- `GET /api/workspaces/:id/members`
- `POST /api/workspaces/:id/members` (Administrator / Workspace Manager)
- `DELETE /api/workspaces/:id/members/:memberId` (Administrator / Workspace Manager)

**Dashboards**
- `GET /api/dashboards` (workspace_id, search, category, status, page, limit)
- `POST /api/dashboards` (Administrator / Workspace Manager)
- `PUT /api/dashboards/:id` (Administrator / Workspace Manager)
- `PATCH /api/dashboards/:id/archive` (Administrator / Workspace Manager)
- `DELETE /api/dashboards/:id` (Administrator / Workspace Manager)

**Activity**
- `GET /api/activity` (workspace_id, page, limit)

**Dashboard Summaries**
- `GET /api/dashboard/admin`
- `GET /api/dashboard/manager`
- `GET /api/dashboard/member`
- `GET /api/dashboard/users` (Administrator - list of all users)

All routes except `/api/login` require `Authorization: Bearer <token>`.

---

## 4. Test Credentials

Password for all seeded accounts: **Password123!**

| Role              | Email                 |
|-------------------|------------------------|
| Administrator     | admin@example.com      |
| Workspace Manager | manager@example.com    |
| Member            | member@example.com     |

---

## 5. Folder Structure

```
workspace-dashboard-app/
├── backend/
│   ├── config/db.js              # MySQL connection pool
│   ├── db/schema.sql             # Table definitions (run in MySQL Workbench)
│   ├── db/seed.js                # Demo data seeding script
│   ├── middleware/auth.js        # JWT verification
│   ├── middleware/roleCheck.js   # Role-based + workspace-membership access control
│   ├── routes/auth.js
│   ├── routes/workspaces.js
│   ├── routes/members.js
│   ├── routes/dashboards.js
│   ├── routes/activity.js
│   ├── routes/dashboardSummary.js
│   ├── server.js                 # Express app entrypoint
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/axios.js          # Axios instance w/ auth token interceptor
    │   ├── context/AuthContext.jsx
    │   ├── components/           # Reusable: Layout, Modal, ConfirmDialog, Loader,
    │   │                         # Pagination, SearchBar, StatCard, StatusBadge, ProtectedRoute
    │   ├── pages/
    │   │   ├── Login.jsx, Profile.jsx, Unauthorized.jsx
    │   │   ├── admin/             # WorkspaceManagement, UserAssignment, WorkspaceStatistics
    │   │   ├── manager/           # WorkspaceDashboard, MemberManagement, DashboardManagement
    │   │   └── member/            # MyWorkspaces, DashboardList, ActivityHistory
    │   ├── App.jsx                # Role-based route definitions
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 6. Write-Up Answers

**Relationships between `workspaces`, `workspace_members`, and `dashboards`:**
`workspaces` is the parent entity. `workspace_members` is a join table (many-to-many
between `users` and `workspaces`) that also stores the user's role *within* that
workspace (`Workspace Manager` or `Member`). `dashboards` has a one-to-many relationship
with `workspaces` (`workspace_id` foreign key) — every dashboard belongs to exactly one
workspace, and a workspace can contain many dashboards.

**Role-based authorization:** A JWT issued at login encodes the user's global `role`
(Administrator / Workspace Manager / Member). The `authenticate` middleware verifies
the token on every request; `allowRoles(...)` middleware restricts routes to specific
global roles (e.g. only Administrators can create workspaces). For workspace-scoped
actions (managing members, dashboards), `requireWorkspaceAccess` / inline checks look
up the user's `member_role` in `workspace_members` for that specific workspace, so a
Workspace Manager only has elevated rights inside workspaces they actually manage.

**Restricting access to assigned workspaces only:** Every workspace/dashboard/activity
query is scoped server-side. Administrators bypass the filter; all other users have
their accessible `workspace_id`s derived from `workspace_members` and every list/detail
query filters on that set (or returns 403 if a specific workspace isn't in it). This is
enforced in the API, not just hidden in the UI, so it can't be bypassed by calling the
endpoints directly.

**Reusable React components:** `Layout` (sidebar/nav shell), `Modal`, `ConfirmDialog`,
`Loader`, `Pagination`, `SearchBar`, `StatCard`, `StatusBadge`, and `ProtectedRoute` are
shared across all admin/manager/member pages. This cut duplicated markup significantly,
kept styling consistent, and means a UX change (e.g. how a delete confirmation looks)
only needs to be made once.

**Scaling to hundreds of workspaces / thousands of dashboards:**
- Backend: the list endpoints already paginate and filter in SQL (not in JS), and the
  schema has indexes on `status`, `workspace_id`, and `category`. At larger scale I'd
  add composite indexes matching common filter combinations, move heavy aggregate
  queries (the statistics endpoint) to a cached/materialized summary table refreshed
  periodically, and consider read replicas for reporting queries.
- Frontend: keep server-side pagination (already implemented) rather than loading full
  lists, add virtualization for very long tables, memoize expensive chart renders, and
  debounce/cache search requests (SearchBar already debounces). Code-splitting per
  role-section (admin/manager/member bundles) would also reduce initial load size.
