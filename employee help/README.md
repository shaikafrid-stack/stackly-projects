# Employee Helpdesk & Knowledge Base Management System

A full-stack helpdesk application where **employees** raise support tickets, **support engineers** resolve them, and **admins** manage users, categories, and analytics — plus a shared, searchable **knowledge base**.

- **Frontend:** React.js (Vite) + Tailwind CSS + React Router + Recharts
- **Backend:** Node.js + Express.js + JWT Auth
- **Database:** MySQL

---

## 1. Project Structure

```
.
├── backend/
│   ├── config/db.js              # MySQL connection pool
│   ├── middleware/auth.js        # JWT auth + role-based authorization
│   ├── controllers/              # Business logic
│   ├── routes/                   # Express routers
│   ├── schema.sql                # DB schema + seed data (raw SQL)
│   ├── seed.js                   # Programmatic seeder (recommended)
│   ├── server.js                 # App entry point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/axios.js          # Axios instance with JWT interceptor
    │   ├── context/              # Auth + Theme context providers
    │   ├── components/           # Layout, ProtectedRoute, badges, etc.
    │   └── pages/
    │       ├── auth/             # Login, Register
    │       ├── common/           # Dashboard, Tickets, KB, Profile (role-aware)
    │       ├── employee/         # Create Ticket
    │       └── admin/            # User & Category management
    ├── .env.example
    └── package.json
```

---

## 2. Prerequisites

- Node.js v18+
- MySQL 8.x (or compatible)
- npm

---

## 3. Database Configuration

1. Start MySQL and create the database using the provided schema:

   ```bash
   mysql -u root -p < backend/schema.sql
   ```

   This creates the `helpdesk_db` database, all tables, default ticket categories, and 3 seed users.

2. Alternatively, create an empty database and use the seed script instead (recommended — it hashes passwords correctly at runtime):

   ```sql
   CREATE DATABASE helpdesk_db;
   ```

   Then run the tables portion of `schema.sql` (everything above the `-- Seed:` sections), and run:

   ```bash
   cd backend
   npm install
   npm run seed
   ```

---

## 4. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your MySQL credentials and a strong JWT_SECRET
npm run dev        # starts on http://localhost:5000
```

Health check: `GET http://localhost:5000/api/health`

---

## 5. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL should point to your backend, e.g. http://localhost:5000/api
npm run dev         # starts on http://localhost:5173
```

---

## 6. Test User Credentials

All seeded accounts use the password: **`Password123`**

| Role              | Email                  |
|-------------------|-------------------------|
| Admin             | admin@helpdesk.com      |
| Support Engineer  | support@helpdesk.com    |
| Employee          | employee@helpdesk.com   |

You can also register new accounts directly from the Register page (role selectable for demo purposes — see write-up question 2 for how this would differ in production).

---

## 7. API Endpoints

### Authentication
| Method | Endpoint         | Access  | Description                |
|--------|-------------------|---------|-----------------------------|
| POST   | `/api/register`   | Public  | Create a new account        |
| POST   | `/api/login`       | Public  | Log in, returns JWT         |
| GET    | `/api/profile`     | Auth    | Get current user's profile  |

### Tickets
| Method | Endpoint            | Access                          | Description |
|--------|-----------------------|----------------------------------|-------------|
| GET    | `/api/tickets`         | Auth (scoped by role)            | List tickets — supports `?search=&category=&priority=&status=&page=&limit=` |
| GET    | `/api/tickets/:id`     | Auth (owner/assignee/admin)      | Ticket detail + status history |
| POST   | `/api/tickets`         | Employee                         | Create ticket |
| PUT    | `/api/tickets/:id`     | Owner / assigned engineer / admin | Update status, resolution notes, reassignment, comments, close |
| DELETE | `/api/tickets/:id`     | Admin                             | Delete ticket |

### Knowledge Base
| Method | Endpoint             | Access                     | Description |
|--------|------------------------|-----------------------------|-------------|
| GET    | `/api/articles`        | Auth                        | Search/list — `?search=&category=&page=&limit=` |
| GET    | `/api/articles/:id`    | Auth                        | Get single article |
| POST   | `/api/articles`        | Support Engineer, Admin     | Create article |
| PUT    | `/api/articles/:id`    | Support Engineer, Admin     | Update article |
| DELETE | `/api/articles/:id`    | Admin                       | Delete article |

### Categories
| Method | Endpoint              | Access | Description |
|--------|-------------------------|--------|-------------|
| GET    | `/api/categories`       | Auth   | List categories |
| POST   | `/api/categories`       | Admin  | Create category |
| PUT    | `/api/categories/:id`   | Admin  | Update category |
| DELETE | `/api/categories/:id`   | Admin  | Delete category |

### Dashboard
| Method | Endpoint                 | Access            | Description |
|--------|----------------------------|--------------------|-------------|
| GET    | `/api/dashboard/employee`  | Employee           | Total / open / closed tickets, recently updated |
| GET    | `/api/dashboard/support`   | Support Engineer   | Assigned / resolved / pending, avg resolution time |
| GET    | `/api/dashboard/admin`     | Admin               | Totals, tickets by status/priority, monthly resolution trend |

### Users (Admin)
| Method | Endpoint               | Access | Description |
|--------|--------------------------|--------|-------------|
| GET    | `/api/users`             | Admin  | List all users |
| GET    | `/api/users/engineers`   | Admin, Support Engineer | List support engineers (for assignment dropdowns) |
| PUT    | `/api/users/:id`         | Admin  | Update a user's name/role |
| DELETE | `/api/users/:id`         | Admin  | Delete a user |

---

## 8. Features Implemented

- JWT authentication with protected routes and role-based navigation
- Employee: create/view/update/close own tickets, search KB, view ticket status history
- Support Engineer: view assigned tickets, update status, add resolution notes, reassign tickets, manage KB articles
- Admin: manage users (role changes/deletion), manage categories, view all tickets, monitor resolution stats, manage KB, analytics dashboard with charts (Recharts)
- Search by ticket title, filter by category/priority/status, pagination throughout
- Client + server-side form validation, loading indicators, centralized error handling (toast notifications)
- Responsive layout with a dark/light theme toggle
- Mock file attachment (filename captured and stored; no binary upload/storage layer)

### Bonus features included
- Dashboard charts using Recharts (pie/bar/line)
- Toast notifications (react-hot-toast)
- Dark/Light theme toggle

### Not implemented (left as extension points)
- CSV export of ticket reports
- Real email notification simulation (the ticket_comments/status-history log serves as an in-app equivalent)

---

## 9. Write-Up Answers

### a) Relationships between `users`, `tickets`, `ticket_comments`, `knowledge_base`, and `ticket_categories`

- **`users` → `tickets`**: one-to-many, twice over. Each ticket has an `employee_id` (the raiser) and an optional `assigned_engineer_id` (the resolver), both foreign keys into `users`. A user can raise many tickets and, if a support engineer, be assigned many tickets.
- **`tickets` → `ticket_comments`**: one-to-many. Each ticket accumulates a thread of comments/status-history entries; each comment also references the `user_id` who wrote it, so `ticket_comments` is really an associative/log table between `tickets` and `users`.
- **`users` → `knowledge_base`**: one-to-many via `created_by`. Any support engineer or admin can author multiple KB articles.
- **`tickets.category` / `knowledge_base.category`** are stored as strings that logically reference `ticket_categories.category_name`. In this implementation the FK is enforced at the application layer (category dropdowns are populated from `ticket_categories`) rather than as a hard DB foreign key, so category names can be renamed/retired without cascading ticket rewrites. A stricter design would replace the string column with a `category_id` FK.

### b) Role-based authorization implementation

- On login/register, the server issues a JWT containing `{ id, name, email, role }`, verified on every request by an `authenticate` middleware that attaches `req.user`.
- Route-level authorization uses an `authorize(...roles)` middleware that rejects requests from users whose role isn't in the allowed list (e.g., only `admin` can hit `DELETE /api/categories/:id`).
- Some endpoints (like tickets) need per-record logic beyond a simple role check — e.g. an employee may only see *their own* tickets, an engineer only *their assigned* tickets. That's handled inside the controller (`getTickets`, `updateTicket`) by comparing `req.user.id`/`role` against the record's `employee_id`/`assigned_engineer_id`, rather than being expressible as a static route-level rule.
- On the frontend, a `ProtectedRoute` component checks for a logged-in user and an optional `allowedRoles` list before rendering a page, and the sidebar navigation is generated per-role so users never see links to modules they can't access. This is a UX convenience only — the backend is the actual enforcement boundary.

### c) Ensuring only authorized users can update/close tickets

`PUT /api/tickets/:id` loads the ticket first, then computes three booleans: `isOwner` (employee who raised it), `isAssignedEngineer`, and `isAdmin`. If none are true, the request is rejected with 403 before any field is touched. Field-level rules are then layered on top:
- Employees (owners) may edit their own ticket's basic fields and close it, but cannot reopen a resolved/closed ticket or change its assignment/resolution notes.
- Assigned engineers and admins may change status, resolution notes, and reassignment.
- Only admins can delete a ticket outright.

This is enforced server-side regardless of what the client sends, so a modified frontend request still can't bypass the checks.

### d) Validations before creating/resolving a ticket

**Creation:** title, description, category, and priority are required; priority must be one of `Low/Medium/High`; the frontend also requires these fields before submission and shows inline errors. Category values are constrained to the admin-managed `ticket_categories` list via a dropdown (not free text).

**Resolution/update:** status must be one of the four valid enum values; an employee cannot reopen a resolved/closed ticket; resolution notes and reassignment are only accepted from an assigned engineer or admin; every meaningful change (status change or comment) is appended to `ticket_comments` so there's an auditable history.

### e) Scaling to multiple departments with dedicated support teams

- **Database:** add a `departments` table (`id`, `name`) and a `department_id` FK on `users` (so employees and engineers belong to a department) and on `tickets` (so a ticket is scoped to a department at creation, likely derived from the employee's department or a manually chosen one). `ticket_categories` could also become department-scoped (`department_id` nullable for shared/global categories) so each department can maintain its own taxonomy alongside shared ones. `knowledge_base` articles would gain an optional `department_id` for department-specific documentation while still allowing company-wide articles.
- **Application/API:** ticket queries and assignment-eligible engineer lists would filter by department; the admin dashboard would add a department dimension (or a "Department Admin" role scoped to their own department, sitting between `support_engineer` and global `admin`); the "assign engineer" dropdown would only list engineers within the ticket's department (with an escalation path to cross-department admins for edge cases).
- **Architecture:** at small-to-medium scale this stays a single service with department as a first-class filter dimension (as above). At larger scale, if departments need independent scaling, data isolation, or separate deployment cadences, this could evolve toward department-partitioned data (schema-per-department or a `department_id` used for horizontal sharding) behind a shared API gateway, with a central identity/auth service so users can be provisioned once and mapped to the correct department context.

---

## 10. Screenshots & Demo Video

Screenshots (Login, each dashboard, Ticket Management, Knowledge Base, Analytics) and the 5–7 minute demo video are not included in this repository export — add them under a `/screenshots` folder and link the video here before submission.
