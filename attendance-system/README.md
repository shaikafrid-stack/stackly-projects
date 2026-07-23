# Employee Attendance & Shift Management System

A full-stack web application for managing employee attendance and shift schedules, with role-based access for **Admin**, **Manager**, and **Employee** users.

- **Frontend:** React.js (Vite) + Tailwind CSS + Recharts + React Router
- **Backend:** Node.js + Express.js + JWT authentication
- **Database:** MySQL

---

## 1. Project Structure

```
attendance-system/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # MySQL connection pool
│   │   ├── middleware/auth.js    # JWT verification & role guards
│   │   ├── routes/               # auth, attendance, shifts, regularization, dashboard, users
│   │   ├── utils/
│   │   │   ├── attendanceHelpers.js  # total hours / status calculation logic
│   │   │   └── seed.js           # seeds test users, shifts & sample attendance
│   │   └── server.js             # Express app entry point
│   ├── schema.sql                # Full database schema
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/axios.js          # Axios instance with JWT interceptor
│   │   ├── context/              # AuthContext, ThemeContext
│   │   ├── components/           # Layout, ProtectedRoute, StatCard, Badge, Pagination...
│   │   ├── pages/                # Login, Register, dashboards, Attendance, Shifts, Regularization, Users
│   │   └── App.jsx
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## 2. Project Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL 8+

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env      # then edit .env with your MySQL credentials & JWT secret
```

Create the database schema:

```bash
mysql -u root -p < schema.sql
```

Seed test users, shifts, and sample attendance data:

```bash
npm run seed
```

Start the API server:

```bash
npm run dev      # nodemon (development)
# or
npm start        # production
```

The API runs at `http://localhost:5000` by default. Health check: `GET /api/health`.

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env      # set VITE_API_BASE_URL if backend runs elsewhere
npm run dev
```

The app runs at `http://localhost:5173` by default.

---

## 3. Database Configuration

Configure `backend/.env`:

```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=attendance_system
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

The schema (`backend/schema.sql`) creates:

- **users** — id, name, email, password (bcrypt hash), role (admin/manager/employee), `manager_id` (FK to users, links an employee to their manager), `shift_id` (FK to shifts, current assignment), is_active
- **shifts** — id, shift_name, start_time, end_time, grace_minutes
- **attendance** — id, employee_id, shift_id, attendance_date, check_in, check_out, total_hours, status (Present/Absent/Half Day/Late) — unique per (employee_id, attendance_date)
- **regularization_requests** — id, employee_id, attendance_id, reason, requested_check_in/out, status (Pending/Approved/Rejected), manager_comments, requested_at, resolved_at

---

## 4. API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/register` | Public | Register a new user |
| POST | `/api/login` | Public | Login, returns JWT |
| GET | `/api/profile` | Authenticated | Get logged-in user's profile |

### Attendance
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/attendance/checkin` | Employee | Mark today's check-in |
| PUT | `/api/attendance/checkout` | Employee | Mark today's check-out |
| GET | `/api/attendance` | All (scoped by role) | List attendance, filters: `employee_id, start_date, end_date, status, page, limit` |
| GET | `/api/attendance/:id` | All (scoped by role) | Single attendance record |

### Shifts
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/shifts` | All | List all shifts |
| POST | `/api/shifts` | Admin | Create a shift |
| PUT | `/api/shifts/:id` | Admin | Update a shift |
| DELETE | `/api/shifts/:id` | Admin | Delete a shift |
| PUT | `/api/shifts/assign/:userId` | Admin, Manager | Assign a shift to an employee |

### Regularization
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/regularization` | Employee | Submit a regularization request |
| GET | `/api/regularization` | All (scoped by role) | List requests, filter by `status` |
| PUT | `/api/regularization/:id/approve` | Manager, Admin | Approve request & update attendance |
| PUT | `/api/regularization/:id/reject` | Manager, Admin | Reject request |

### Dashboard
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/dashboard/employee` | Employee |
| GET | `/api/dashboard/manager` | Manager |
| GET | `/api/dashboard/admin` | Admin |

### Users (Admin/Manager)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users` | Admin, Manager | Search/paginate users (managers see only their team) |
| GET | `/api/users/:id` | Admin, Manager | Get one user |
| PUT | `/api/users/:id` | Admin | Update role, manager, active status, or reset password |
| DELETE | `/api/users/:id` | Admin | Delete a user |

All protected routes require header: `Authorization: Bearer <token>`

---

## 5. Test User Credentials

After running `npm run seed` in `backend/`:

| Role | Email | Password |
|---|---|---|
| Admin | admin@company.com | Password123! |
| Manager | manager@company.com | Password123! |
| Employee | employee1@company.com | Password123! |
| Employee | employee2@company.com | Password123! |
| Employee | employee3@company.com | Password123! |

---

## 6. Features Implemented

**Authentication:** Registration, login, logout, JWT-protected routes, role-based navigation and route guards.

**Employee:** Check-in / check-out, attendance history with date & status filters, view assigned shift, apply for regularization, dashboard (today's status, monthly hours, attendance %, pending requests).

**Manager:** Assign shifts to team members, approve/reject regularization requests, view team attendance summary, dashboard (team size, absentees today, late check-ins, pending approvals).

**Admin:** Manage users (search, filter, activate/deactivate, delete, reassign roles/shifts), manage shift schedules (CRUD), organization-wide dashboard with monthly attendance trend chart and shift utilization chart (Recharts).

**Cross-cutting:** Search & pagination, form validation, loading indicators, toast notifications, dark/light theme toggle, responsive layout, CSV export of attendance records, simulated email notification (logged server-side) on regularization approval/rejection.

---

## 7. Write-Up Answers

**Q1. Relationships between users, attendance, shifts, and regularization_requests**
`users` is the central table: each employee optionally has a `manager_id` referencing another user (self-referencing FK, one manager → many employees) and a `shift_id` referencing `shifts` (one shift → many employees currently assigned). `attendance` has a many-to-one relationship with `users` (one employee → many daily attendance rows, unique per date) and a many-to-one relationship with `shifts` (records which shift applied that day). `regularization_requests` has a many-to-one relationship with both `users` (the requesting employee) and `attendance` (the specific day being corrected) — an employee can file at most one active correction per attendance row at a time, referenced by `attendance_id`.

**Q2. Role-based access control (RBAC)**
On login, the server issues a JWT containing `id`, `name`, `email`, and `role`. An Express middleware (`verifyToken`) validates the token on every protected route, and a `requireRole(...roles)` middleware checks `req.user.role` against an allow-list per route (e.g., only `admin` can create/delete shifts; only `employee` can check in). Data-level scoping is additionally enforced in SQL queries — managers only see rows where `users.manager_id = req.user.id`, employees only see their own `employee_id`. On the frontend, `ProtectedRoute` redirects unauthenticated users to `/login` and restricts pages via an `allowedRoles` prop; the sidebar navigation is generated per role so users never see links to pages they can't access.

**Q3. Calculating total working hours and attendance status**
On check-out, `total_hours` is computed as `(check_out − check_in)` in milliseconds converted to hours and rounded to 2 decimals (`attendanceHelpers.computeTotalHours`). Status is derived in `computeStatus`: if there's no check-in, status is `Absent`; if `total_hours < 4`, status is `Half Day`; otherwise, the check-in time is compared to the assigned shift's `start_time` plus a configurable `grace_minutes` — if check-in is after that grace window, status is `Late`, otherwise `Present`. The same logic re-runs when a regularization request is approved, so corrected times recompute hours/status automatically.

**Q4. Validations before check-in / check-out**
Check-in: rejected if the employee already has a check-in recorded for today (via the `attendance` table's unique `(employee_id, attendance_date)` constraint plus an explicit existence check) — prevents duplicate check-ins. Check-out: rejected if there is no prior check-in for today, and rejected if a check-out already exists for today. All authentication/role checks (must be logged in as `employee`) also apply. Input validation (`express-validator`) guards registration/login/shift/regularization payloads for required fields, email format, and minimum password length.

**Q5. Supporting multiple office locations and time zones**
Database changes: add a `locations` table (id, name, address, timezone e.g. `Asia/Kolkata`) and a `location_id` FK on `users` and/or `shifts` (shifts could be location-specific since working hours differ by site). Store all timestamps in UTC in the database and convert to each location's local timezone only at the presentation layer, rather than storing local wall-clock time — this avoids ambiguity around daylight saving and cross-region reporting. Add a `location_id` filter to attendance/dashboard queries so admins can view analytics per location or aggregated globally. Application architecture changes: pass the user's resolved timezone (from their location record) through the JWT/profile so the frontend can render times correctly; move "late" threshold calculations to compare against the shift's local start time converted to UTC at query time rather than doing naive string comparisons; consider a small geolocation/IP check or location dropdown at check-in to auto-assign the correct site; and partition or index attendance queries by `location_id` for performance as the dataset grows across regions.

---

## 8. Screenshots & Demo Video

Add screenshots of the Login page, Employee/Manager/Admin dashboards, Attendance management, Shift management, and Reports dashboard to a `screenshots/` folder, and link your demo video here once recorded, per the submission requirements.

---

## 9. Notes & Assumptions

- Passwords are hashed with bcrypt (10 salt rounds); never stored in plaintext.
- "Absent" records are not auto-inserted by a nightly job in this reference implementation — a production deployment would add a scheduled job (e.g., `node-cron`) that inserts an `Absent` row for any employee with no attendance record at end-of-day, and/or the dashboard queries should treat "no record for date" as absent when computing percentages over a date range.
- Email notification for regularization approval/rejection is simulated via a `console.log` in the backend (see `routes/regularization.js`); swap in a real provider (e.g., Nodemailer + SMTP) by replacing that line.
- CSV export is done client-side from the currently loaded/filtered attendance page.
