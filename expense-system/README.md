# Employee Expense Reimbursement Management System

A full-stack app where employees submit expense reimbursement requests, managers approve/reject them, and admins monitor everything through dashboards and reports.

**Stack:** React + Tailwind CSS (frontend) · Node.js + Express (backend) · MySQL (database)

---

## 1. Project Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL 8+ running locally (or a remote instance)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # then edit .env with your MySQL credentials and a JWT secret
```

Create and seed the database (see section 2), then start the server:

```bash
npm run dev      # nodemon, auto-restarts on changes
# or
npm start
```

The API runs on `http://localhost:5000` by default. Check `GET /api/health` to confirm it's up.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL should point at the backend, e.g. http://localhost:5000/api
npm run dev
```

The app runs on `http://localhost:5173`.

---

## 2. Database Configuration

Schema and seed data live in `backend/database/`.

```bash
mysql -u root -p < backend/database/schema.sql
mysql -u root -p < backend/database/seed.sql
```

`schema.sql` creates the `expense_reimbursement` database with two tables (`users`, `expenses`). `seed.sql` adds 4 test users and 5 sample expenses so you can log in and explore right away.

---

## 3. Test User Credentials

All seeded accounts use the password: **`password123`**

| Role     | Email                 |
|----------|------------------------|
| Admin    | admin@company.com     |
| Manager  | manager@company.com   |
| Employee | employee@company.com  |
| Employee | john@company.com      |

You can also register new accounts from the app's Register page (role selectable for demo purposes — see write-up question 2 for how this would be locked down in production).

---

## 4. API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/register` | Public | Create a new account |
| POST | `/api/login` | Public | Log in, returns JWT |
| GET | `/api/profile` | Authenticated | Get current user's profile |
| GET | `/api/users` | Admin | List all users |
| PUT | `/api/users/:id/role` | Admin | Change a user's role |
| DELETE | `/api/users/:id` | Admin | Delete a user |

### Expenses
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/expenses` | Authenticated | List expenses (employees see only their own). Supports `?status=&category=&search=&sortBy=&order=&page=&limit=` |
| GET | `/api/expenses/:id` | Authenticated | Get a single expense |
| POST | `/api/expenses` | Employee | Submit a new expense |
| PUT | `/api/expenses/:id` | Employee (owner) | Edit — only while `Pending` |
| DELETE | `/api/expenses/:id` | Employee (owner) / Admin | Cancel — only while `Pending` |
| PUT | `/api/expenses/:id/approve` | Manager / Admin | Approve a pending request |
| PUT | `/api/expenses/:id/reject` | Manager / Admin | Reject a pending request (requires `comments`) |

### Dashboards
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/dashboard/employee` | Employee | Personal summary + recent requests |
| GET | `/api/dashboard/manager` | Manager / Admin | Org-wide summary + pending queue |
| GET | `/api/dashboard/admin` | Admin | Summary, category breakdown, monthly trend, user counts |

---

## 5. Features Implemented

- JWT authentication with protected routes and role-based navigation (Admin / Manager / Employee)
- Employee: submit, edit, cancel (pending-only), view own requests
- Manager: view, approve, reject with mandatory comments, filter by employee/status
- Admin: view all requests, manage users, dashboard stats, monthly reports
- Search by title, filter by status/category, sort by date, pagination
- Form validation (client + server side) and toast notifications
- Loading states and centralized error handling
- Responsive Tailwind UI
- Bonus: Recharts summary charts, CSV export, receipt filename attachment

---

## 6. Write-Up Questions

**Q1. Relationship between `users` and `expenses`**
It's a one-to-many relationship: one row in `users` (an employee) can have many rows in `expenses`, linked by `expenses.employee_id` as a foreign key referencing `users.id` (`ON DELETE CASCADE`). A second, optional foreign key, `expenses.reviewed_by`, also points back to `users.id` to record which manager/admin approved or rejected the request.

**Q2. Role-based access control**
On login, the server signs a JWT containing the user's `id`, `email`, and `role`. Every protected API route runs an `authenticate` middleware that verifies the token, then an `authorize(...roles)` middleware that checks `req.user.role` against an allow-list before the controller runs — so, for example, only `employee` can hit `POST /api/expenses`, and only `manager`/`admin` can hit the approve/reject routes. On the frontend, a `ProtectedRoute` component checks the logged-in user's role before rendering a page and redirects them to their own dashboard otherwise, and the navbar only renders links relevant to that role. In this demo, registration lets you pick a role for convenience; in production, self-registration would default everyone to `employee` and role changes would be admin-only (the `PUT /api/users/:id/role` endpoint already enforces that).

**Q3. Ensuring only pending requests can be edited/cancelled**
The check happens server-side, not just in the UI: `updateExpense` and `deleteExpense` both fetch the expense first and return a 400 error if `status !== 'Pending'` before applying any change (an admin can still cancel non-pending records for cleanup, but a regular employee cannot). The same rule is mirrored in the frontend by only rendering the Edit/Cancel buttons when `status === 'Pending'`, so the UI matches what the API will actually allow — but the API is the real enforcement point.

**Q4. Validations before submission**
- Title: required, minimum 3 characters
- Category: must be one of the fixed enum values
- Amount: required, numeric, greater than 0
- Expense date: required, valid date, cannot be in the future
These are validated on the client (immediate feedback) and re-validated on the server (source of truth) before any insert/update.

**Q5. Scaling to multiple departments and approval levels**
I'd add a `departments` table (`id`, `name`) and a `department_id` foreign key on `users`, plus an `approval_levels` or `approval_chain` table that defines an ordered sequence of approver roles per department (e.g. Manager → Department Head → Finance). Expenses would gain a `current_level` column, and approving an expense would advance it to the next level instead of immediately marking it `Approved`, only flipping to `Approved` once it clears the last level (rejection at any level would end the chain). Dashboards would need a department filter, and the approval routes would need to check both the approver's role and that they're actually the person responsible for the expense's current level and department — likely via a `department_managers` mapping table for cases where more than one manager can approve for a department.
