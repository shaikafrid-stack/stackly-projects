# Asset Maintenance & Service Request Management System

A full-stack application where employees raise service requests for company assets, maintenance engineers resolve them, and admins monitor asset utilization and operational analytics.

**Stack:** React.js + Tailwind CSS (frontend) · Node.js + Express (backend) · MySQL (database)

---

## 1. Setup Instructions

### Prerequisites
- Node.js v18+
- MySQL 8+
- npm

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MySQL credentials and a JWT secret
```

Create the database and tables (see [Database Setup](#2-database-setup) below), then:

```bash
npm run seed   # creates demo users + sample assets (optional but recommended)
npm run dev    # starts the server on http://localhost:5000 (nodemon)
# or: npm start
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if your backend runs on a different URL
npm run dev    # starts the app on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 2. Database Setup

1. Log in to MySQL:
   ```bash
   mysql -u root -p
   ```
2. Run the schema file (creates the database and all 5 tables with relationships/indexes):
   ```bash
   mysql -u root -p < backend/config/schema.sql
   ```
3. Update `backend/.env` with your `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
4. (Optional) Seed demo data:
   ```bash
   cd backend
   npm run seed
   ```

### Tables created
`users` · `assets` · `service_requests` · `maintenance_logs` · `asset_history`

---

## 3. Test Credentials

After running `npm run seed`, the following accounts are available (all use password `Password@123`):

| Role                 | Email                  |
|----------------------|-------------------------|
| Admin                | admin@company.com       |
| Maintenance Engineer | engineer@company.com    |
| Employee             | employee@company.com    |

You can also register new accounts directly from the app's Register page (role selectable).

---

## 4. Folder Structure Overview

```
backend/
  config/           # DB pool connection + MySQL schema.sql
  controllers/       # Route handlers: auth, asset, serviceRequest, maintenance, dashboard, user
  routes/            # Express routers mapped to controllers
  middlewares/        # JWT authentication + role-based authorization
  services/           # Business logic: authService, assetHistoryService
  utils/              # response formatting, pagination helper, seed script
  server.js           # Express app entrypoint

frontend/
  src/
    pages/
      employee/       # EmployeeDashboard, RaiseRequest, MyRequests
      engineer/       # EngineerDashboard, AssignedRequests
      admin/          # AdminDashboard (analytics), AssetManagement, AdminServiceRequests
      Login.jsx, Register.jsx, NotFound.jsx, RoleRedirect.jsx
    components/       # Navbar, ProtectedRoute, Modal, Pagination, SearchFilterBar, Badges, Loading
    context/          # AuthContext (JWT/session state)
    hooks/             # (reserved for custom hooks)
    services/          # axios API clients per resource
    charts/            # Recharts wrappers used in the Analytics Dashboard
    utils/              # (reserved for shared frontend utils)
```

---

## 5. API Reference

**Auth:** `POST /api/register` · `POST /api/login` · `GET /api/profile`

**Assets:** `GET /api/assets` · `GET /api/assets/:id` · `POST /api/assets` (admin) · `PUT /api/assets/:id` (admin) · `DELETE /api/assets/:id` (admin)

**Service Requests:** `POST /api/service-requests` (employee) · `GET /api/service-requests` · `GET /api/service-requests/:id` · `PUT /api/service-requests/:id` (admin/engineer) · `DELETE /api/service-requests/:id` (admin)

**Maintenance Logs:** `POST /api/maintenance-logs` (engineer) · `GET /api/maintenance-logs`

**Dashboards:** `GET /api/dashboard/admin` · `GET /api/dashboard/maintenance` · `GET /api/dashboard/employee`

**Users:** `GET /api/users?role=...` (admin only, used for engineer/employee dropdowns)

All list endpoints support `?search=&status=&priority=&page=&limit=` where applicable.

---

## 6. Write-Up Questions

**1. Relationship between assets, service requests, and maintenance logs**

Each `asset` can have many `service_requests` (one-to-many via `asset_id`), raised by an `employee` and optionally routed to a `maintenance_engineer` (`assigned_engineer_id`). Each `service_request` can accumulate many `maintenance_logs` (one-to-many via `request_id`) as an engineer records diagnostic notes and, eventually, a resolution summary. All asset-related events (creation, status changes, reassignment, requests raised, engineer assignment) are additionally appended to `asset_history` for a full audit trail independent of the active request lifecycle.

**2. Role-based access control implementation**

Every user has a `role` column (`admin`, `maintenance_engineer`, `employee`) set at registration. On login, the role is embedded in a signed JWT. The `authenticate` middleware verifies the token on every protected route, and an `authorize(...roles)` middleware restricts specific routes to specific roles (e.g. only `admin` can create/delete assets; only `employee` can raise a request; only the assigned `maintenance_engineer` can update their own requests or add logs). Controllers additionally scope query results by `req.user.id`/`role` so, for example, employees only ever see their own assets and requests, and engineers only see requests assigned to them — this is enforced server-side, not just hidden in the UI. The frontend mirrors this with `ProtectedRoute` (redirects unauthenticated/unauthorized users) and role-specific navigation.

**3. Tracking maintenance history for assets**

The `asset_history` table logs a timestamped, human-readable trail of every significant event tied to an asset: creation, status changes, reassignment to a different employee, a service request being raised, an engineer being assigned, and status transitions on associated requests (e.g. moving to "In Progress" or back to "active" on resolution). This is surfaced in the asset detail view (`GET /api/assets/:id` returns the asset plus its full history) so admins can see a complete operational timeline independent of any single request.

**4. Validations before resolving a service request**

An engineer cannot mark a request `Resolved` directly — the `PUT /api/service-requests/:id` endpoint rejects a `Resolved` status change unless a `maintenance_logs` row already exists for that request. In practice, the frontend enforces this by requiring the engineer to submit a maintenance log with a non-empty `resolution_summary` (and the `mark_resolved` flag) via `POST /api/maintenance-logs`, which then transitions the request to `Resolved` and the asset back to `active` status as a side effect. Engineers can only act on requests explicitly assigned to them (`assigned_engineer_id` must match `req.user.id`), and status values are validated against the fixed enum (`Open, Assigned, In Progress, Resolved, Closed`).

**5. Scaling across multiple office locations**

Key architectural changes to consider:
- Add a `locations`/`sites` table and a `location_id` foreign key on `users` and `assets`, and scope all dashboards/queries by location so admins can filter globally or per-site, with a "regional admin" role sitting between `admin` and site-level users.
- Move from a single MySQL instance to a read-replica setup (or sharding by location) to handle higher read volume from multiple sites, with a caching layer (Redis) in front of dashboard/analytics endpoints.
- Introduce a message queue (e.g. RabbitMQ/SQS) for cross-cutting workflows — engineer assignment notifications, SLA-breach alerts, escalations — so the API layer stays responsive under load.
- Centralize authentication (SSO/OAuth) if offices use different identity providers, and consider per-location JWT claims to keep authorization scoped correctly.
- Introduce a CDN + object storage (S3-compatible) for any future file/photo attachments to service requests, rather than storing them in the app server's filesystem.
- Add observability (structured logging, request tracing, per-location metrics) so operational issues can be isolated to a specific site rather than requiring a global search.

---

## 7. Screenshots & Demo Video

Screenshots and a short demo video are not included in this generated codebase — please capture these from your running instance for submission, covering: Login, Asset Management, Service Request Flow, Maintenance Dashboard, Analytics Dashboard, and the Resolution Workflow, plus a demo video showing the Employee, Maintenance Resolution, and Admin Monitoring flows end to end.
