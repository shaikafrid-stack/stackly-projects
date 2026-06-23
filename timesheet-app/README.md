# TimeTrack Pro — Employee Project & Timesheet Management System

A full-stack web application built with **React + Flask + MySQL** for managing employee work hours, project assignments, and generating productivity reports.

---

## 🚀 Features

- **Role-Based Access Control** — Separate Employee and Manager dashboards
- **Project Management** — Create, edit, delete projects (Manager)
- **Employee Assignment** — Assign/unassign employees to projects (Manager)
- **Timesheet Submission** — Log work hours with task descriptions (Employee)
- **Timesheet Monitoring** — View, filter, and delete all timesheets (Manager)
- **Reports & Charts** — Bar charts, pie charts, top-5 active employees (Manager)
- **Filters & Pagination** — Filter by project, employee, date range
- **JWT Authentication** — Secure token-based auth with protected routes
- **Form Validation** — Frontend + backend validation on all inputs

---

## 🛠️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, React Router v6, Recharts, Axios |
| Backend   | Flask, Flask-SQLAlchemy, Flask-CORS, PyJWT |
| Database  | MySQL                               |
| Styling   | Custom CSS (no external UI library) |

---

## 📂 Folder Structure

```
timesheet-app/
├── backend/
│   ├── app.py              # Flask app factory & entry point
│   ├── config.py           # App configuration
│   ├── seed.py             # Seed demo data
│   ├── requirements.txt
│   ├── models/
│   │   ├── db.py           # SQLAlchemy instance
│   │   └── models.py       # User, Project, EmployeeProject, Timesheet
│   ├── routes/
│   │   ├── auth.py         # /api/register, /api/login, /api/profile
│   │   ├── projects.py     # /api/projects, /api/assign-project
│   │   ├── timesheets.py   # /api/timesheets
│   │   ├── dashboard.py    # /api/dashboard/employee|manager
│   │   └── employees.py    # /api/employees
│   └── utils/
│       └── auth_utils.py   # JWT token helpers, decorators
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx              # Routes & protected route logic
        ├── main.jsx
        ├── index.css            # Global styles
        ├── context/
        │   └── AuthContext.jsx  # Auth state (login, logout, register)
        ├── services/
        │   └── api.js           # Axios instance with interceptors
        ├── components/
        │   └── common/
        │       └── Layout.jsx   # Sidebar + outlet
        └── pages/
            ├── auth/
            │   ├── Login.jsx
            │   └── Register.jsx
            ├── employee/
            │   ├── Dashboard.jsx
            │   ├── MyProjects.jsx
            │   ├── SubmitTimesheet.jsx
            │   └── TimesheetHistory.jsx
            └── manager/
                ├── Dashboard.jsx
                ├── ProjectManagement.jsx
                ├── EmployeeAssignment.jsx
                ├── TimesheetMonitoring.jsx
                └── Reports.jsx
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- MySQL 8.0+

### 1. Database Setup

```sql
CREATE DATABASE timesheet_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'tsuser'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON timesheet_db.* TO 'tsuser'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Edit config.py — update SQLALCHEMY_DATABASE_URI:
# mysql+pymysql://tsuser:yourpassword@localhost/timesheet_db

# Run migrations (tables auto-created on first run)
python app.py

# Seed demo data (optional but recommended)
python seed.py
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**
Backend runs at: **http://localhost:5000**

---

## 🔑 Test Credentials

| Role     | Email                | Password     |
|----------|----------------------|--------------|
| Manager  | manager@demo.com     | manager123   |
| Employee | bob@demo.com         | employee123  |
| Employee | carol@demo.com       | employee123  |
| Employee | david@demo.com       | employee123  |

> Run `python seed.py` in the backend folder to create these accounts.

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint         | Access |
|--------|------------------|--------|
| POST   | /api/register    | Public |
| POST   | /api/login       | Public |
| GET    | /api/logout      | Auth   |
| GET    | /api/profile     | Auth   |

### Projects
| Method | Endpoint              | Access   |
|--------|-----------------------|----------|
| GET    | /api/projects         | Auth     |
| GET    | /api/projects/:id     | Auth     |
| POST   | /api/projects         | Manager  |
| PUT    | /api/projects/:id     | Manager  |
| DELETE | /api/projects/:id     | Manager  |

### Assignments
| Method | Endpoint                    | Access  |
|--------|-----------------------------|---------|
| POST   | /api/assign-project         | Manager |
| GET    | /api/employee-projects      | Auth    |
| DELETE | /api/unassign-project/:id   | Manager |

### Timesheets
| Method | Endpoint               | Access           |
|--------|------------------------|------------------|
| POST   | /api/timesheets        | Employee         |
| GET    | /api/timesheets/my     | Employee         |
| GET    | /api/timesheets        | Manager          |
| PUT    | /api/timesheets/:id    | Employee/Manager |
| DELETE | /api/timesheets/:id    | Employee/Manager |

### Dashboard
| Method | Endpoint                    | Access   |
|--------|-----------------------------|----------|
| GET    | /api/dashboard/employee     | Employee |
| GET    | /api/dashboard/manager      | Manager  |

---

## 📝 Write-Up Answers

### 1. Database Relationships

- **users ↔ projects**: Many-to-Many via `employee_projects` table (a user can work on many projects; a project can have many employees)
- **users → timesheets**: One-to-Many (each timesheet belongs to one employee)
- **projects → timesheets**: One-to-Many (timesheets are logged against a specific project)
- **employee_projects** enforces that timesheets can only be submitted for assigned projects

### 2. Role-Based Access Control

JWT tokens store the user's `role` at login. The backend has two decorators in `utils/auth_utils.py`:
- `@token_required` — verifies any valid JWT
- `@manager_required` — verifies JWT **and** checks `role == 'manager'`, returning 403 otherwise

The frontend uses `ProtectedRoute` which reads the user's role from `AuthContext` and redirects unauthorized users (e.g. an employee navigating to `/manager` is redirected to `/employee`).

### 3. Preventing Employee Access to Manager Pages

Two layers of protection:
1. **Frontend**: React Router `ProtectedRoute` checks `user.role` and redirects to the appropriate base path if the role doesn't match the route
2. **Backend**: Every manager-only endpoint is decorated with `@manager_required`, which returns HTTP 403 regardless of what the frontend sends

### 4. Timesheet Validation

Before accepting a timesheet:
- `project_id`, `work_date`, and `hours_logged` are required (400 if missing)
- `hours_logged` must be between 0.1 and 24 (prevents nonsensical values)
- The employee must be assigned to the project (`EmployeeProject` lookup — returns 403 if not assigned)
- Frontend also validates before sending: required fields, hour range, and a non-empty task description

### 5. First Refactor for Scale (10,000 employees)

**The dashboard aggregate queries** would be first. Currently, `GET /api/dashboard/manager` runs live `SUM()` aggregates across all timesheets on every request. At 10K employees, this becomes a full-table scan.

The fix: introduce a **pre-computed stats table** (or Redis cache) refreshed on a schedule or on timesheet write, so the dashboard reads pre-aggregated numbers instead of scanning millions of rows. Also add database indexes on `timesheets(employee_id, work_date)` and `timesheets(project_id)`.
