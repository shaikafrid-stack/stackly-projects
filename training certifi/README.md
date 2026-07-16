# Employee Training & Certification Management System

A full-stack MERN-style application (React + Node.js/Express + MySQL) where
employees enroll in training programs, trainers manage sessions and issue
certifications, and admins monitor organization-wide progress.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router, Axios, Recharts, react-hot-toast
- **Backend:** Node.js, Express, Sequelize ORM
- **Database:** MySQL
- **Auth:** JWT (JSON Web Tokens) + bcrypt password hashing

## Project Structure

```
project/
├── backend/
│   ├── config/db.js          # Sequelize/MySQL connection
│   ├── models/                # User, TrainingProgram, Enrollment, Certification
│   ├── controllers/           # Business logic
│   ├── routes/                # Express routers
│   ├── middleware/            # auth (JWT + RBAC), error handler
│   ├── server.js               # App entry point
│   ├── seed.js                  # Seeds test users + sample data
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/               # Login, Register, Dashboard, Trainings, Enrollments, Certifications, Users
    │   ├── components/          # Navbar, ProtectedRoute, TrainingFormModal, UI helpers
    │   ├── context/AuthContext.jsx
    │   └── api/axios.js
    └── package.json
```

## 1. Project Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL 8+ running locally (or a remote MySQL instance)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your MySQL credentials and a JWT secret
npm run seed     # creates tables + test users + sample data (drops existing tables!)
npm run dev      # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# edit VITE_API_URL if your backend runs elsewhere
npm run dev      # starts on http://localhost:5173
```

Open http://localhost:5173 in your browser.

## 2. Database Configuration

Create a MySQL database (the app can also auto-create tables via Sequelize sync):

```sql
CREATE DATABASE training_cert_db;
```

Set the following in `backend/.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=training_cert_db
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d
```

Running `npm run seed` drops and recreates all tables, then inserts:
- 1 admin, 2 trainers, 2 employees
- 3 training programs (upcoming/active/completed)
- 3 enrollments in different states
- 1 issued certification

Running `npm run dev` (without seeding) uses `sequelize.sync({ alter: true })`
to create tables non-destructively if they don't already exist.

## 3. API Endpoints

### Authentication
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/register | Public |
| POST | /api/login | Public |
| GET | /api/profile | Authenticated |

### Training Programs
| Method | Endpoint | Access |
|---|---|---|
| GET | /api/trainings | Authenticated (search, status, trainer_id, sortBy, order, page, limit) |
| GET | /api/trainings/:id | Authenticated |
| POST | /api/trainings | Trainer, Admin |
| PUT | /api/trainings/:id | Trainer (own), Admin |
| DELETE | /api/trainings/:id | Trainer (own), Admin |

### Enrollments
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/enrollments | Employee |
| GET | /api/enrollments | Authenticated (scoped by role) |
| PUT | /api/enrollments/:id | Trainer (own trainings), Admin, Employee (own) |

### Certifications
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/certifications | Trainer (own trainings), Admin |
| GET | /api/certifications | Authenticated (scoped by role) |

### Dashboards
| Method | Endpoint | Access |
|---|---|---|
| GET | /api/dashboard/admin | Admin |
| GET | /api/dashboard/trainer | Trainer |
| GET | /api/dashboard/employee | Employee |

### Users (admin management)
| Method | Endpoint | Access |
|---|---|---|
| GET | /api/users | Admin |
| PUT | /api/users/:id | Admin |
| DELETE | /api/users/:id | Admin |

## 4. Test User Credentials

Password for all seeded accounts: `Password123!`

| Role | Email |
|---|---|
| Admin | admin@example.com |
| Trainer | trainer@example.com |
| Trainer | trainer2@example.com |
| Employee | employee@example.com |
| Employee | employee2@example.com |

## 5. Features Implemented

- JWT authentication with register/login/logout and protected routes
- Role-based navigation and route guarding (Admin / Trainer / Employee)
- Employees: browse trainings, enroll (once per program), track progress, view certifications
- Trainers: create/update/delete their own training programs, mark attendance,
  update completion status and progress, issue certificates (only after completion)
- Admins: manage users (role changes, deletion), view all trainings, org-wide dashboard
- Role-specific dashboards with summary cards and a Recharts bar chart
- Search training programs by title, filter by status/trainer, sort by start date, pagination
- Form validation and inline error messages on all forms
- Loading spinners and toast notifications for async actions
- CSV export of certification records
- Centralized Axios client with automatic JWT attachment and 401 handling
- Responsive Tailwind UI (mobile-friendly navbar, grid layouts)

## 6. Write-Up Answers

**Q1. Relationships between users, training_programs, enrollments, and certifications**

- `users` is the root table; a user's `role` column determines whether they act
  as admin, trainer, or employee.
- `training_programs.trainer_id` is a foreign key to `users.id` — each training
  program belongs to exactly one trainer (one-to-many: trainer → programs).
- `enrollments` is a join table between employees and training programs:
  `enrollments.employee_id` → `users.id`, `enrollments.training_id` →
  `training_programs.id`. This models a many-to-many relationship (an employee
  can enroll in many programs, a program can have many employees), with extra
  attributes (progress, status, attendance) on the join row. A unique
  constraint on `(employee_id, training_id)` prevents duplicate enrollments.
- `certifications` also references both `users.id` (employee) and
  `training_programs.id`, effectively a derived record created after an
  enrollment reaches `completed` status. Each certification carries its own
  `certificate_number`, `issued_date`, and `expiry_date`.

**Q2. Role-Based Access Control (RBAC) implementation**

- On login/register, the backend issues a JWT containing the user's `id`.
  The `protect` middleware verifies the token and loads the full user
  (including `role`) onto `req.user` for every subsequent request.
- An `authorize(...roles)` middleware checks `req.user.role` against an
  allow-list per route (e.g. `authorize('trainer', 'admin')` on
  `POST /api/trainings`).
- Controllers add a second, row-level layer: trainers can only edit/delete
  training programs where `training.trainer_id === req.user.id`; employees can
  only view or update their own enrollments/certifications.
- On the frontend, `AuthContext` stores the logged-in user and role. The
  `Navbar` renders different links per role, and a `ProtectedRoute` component
  redirects unauthenticated users to `/login` and unauthorized roles away from
  routes they shouldn't access (e.g. an employee hitting `/users`).

**Q3. Preventing duplicate enrollments**

- The `enrollments` table has a unique composite index on
  `(employee_id, training_id)` at the database level.
- Before creating an enrollment, the controller explicitly checks for an
  existing row with the same `employee_id` and `training_id` and returns a
  `409 Conflict` if found. The unique index is a second line of defense in
  case of race conditions, also mapped to a `409` via Sequelize's
  `SequelizeUniqueConstraintError`.
- On the frontend, the "Enroll" button is disabled once the employee's own
  enrollment list already contains that training's id.

**Q4. Validations performed before issuing a certification**

1. The `training_id` must reference an existing training program.
2. If the caller is a trainer (not admin), the training program must belong
   to them (`training.trainer_id === req.user.id`).
3. An enrollment record must exist for that `employee_id` + `training_id`
   pair (the employee must actually be enrolled).
4. That enrollment's `completion_status` must be `completed` — certificates
   cannot be issued for pending or in-progress training.
5. A duplicate check ensures a certificate hasn't already been issued for
   that employee/training combination.
6. A unique, randomly-suffixed `certificate_number` is generated server-side
   to avoid collisions.

**Q5. Scaling to multiple locations and departments**

Database changes:
- Add `locations` (`id`, `name`, `address`, `timezone`) and `departments`
  (`id`, `name`, `location_id`) tables.
- Add `department_id` to `users` (which department an employee/trainer
  belongs to) and `location_id` to `training_programs` (where/how a session
  is delivered — could also be `NULL`/"virtual").
- Consider a `training_program_locations` join table if a single program can
  run simultaneously at multiple locations with separate schedules/capacity.
- Add indexes on `department_id` and `location_id` for efficient filtering
  and reporting.

Application/architecture changes:
- Extend dashboard and reporting queries to group/filter by location and
  department (e.g. `GET /api/dashboard/admin?location_id=&department_id=`).
- Add location/department scoping to RBAC — e.g. a "Department Trainer" or
  "Site Admin" role that only manages their location/department, requiring an
  extra authorization check similar to the existing `trainer_id` ownership
  check.
- Add location/department filters to the Trainings search UI and to CSV
  exports.
- For larger scale, consider caching dashboard aggregates (e.g. Redis) and,
  if traffic grows significantly, splitting reporting queries into a
  read-replica or a separate analytics service so heavy aggregate queries
  don't compete with transactional traffic.
