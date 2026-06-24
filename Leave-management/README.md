# 📋 Project Resource & Leave Management System

A full-stack web application for managing employee leave requests, project assignments, and resource allocation — built with **React.js + Tailwind CSS** (frontend) and **Java Spring Boot** (backend) with **MySQL** database.

---

## 🗂️ Folder Structure

```
project/
├── frontend/                  # React.js application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── shared/        # Layout, UIComponents (StatCard, Badge, etc.)
│   │   ├── context/           # AuthContext (JWT + user state)
│   │   ├── pages/
│   │   │   ├── employee/      # Dashboard, ApplyLeave, MyLeaves, MyProjects
│   │   │   ├── manager/       # Dashboard, LeaveApproval, TeamAllocation
│   │   │   └── admin/         # Dashboard, UserManagement, ProjectManagement, Reports
│   │   ├── services/          # api.js (Axios instance + all API calls)
│   │   ├── App.js             # Routes + ProtectedRoute
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                   # Spring Boot application
│   ├── src/main/java/com/resourceleave/
│   │   ├── controller/        # AuthController, ProjectController, LeaveController,
│   │   │                      #   EmployeeProjectController, DashboardController, UserController
│   │   ├── dto/               # AuthDTO, LeaveDTO, ProjectDTO
│   │   ├── model/             # User, Project, LeaveRequest, EmployeeProject
│   │   ├── repository/        # JPA Repositories
│   │   ├── security/          # JwtUtils, JwtAuthFilter, UserDetailsServiceImpl
│   │   └── config/            # SecurityConfig
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
├── database/
│   └── schema.sql             # DB creation + seed data
│
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites

| Tool | Version |
|------|---------|
| Java | 17+ |
| Maven | 3.8+ |
| Node.js | 18+ |
| MySQL | 8.0+ |

---

### 1. Database Setup

```sql
-- Option A: Let Spring Boot auto-create tables (recommended)
-- Just create the database:
CREATE DATABASE resource_leave_db;

-- Option B: Run the full schema manually
mysql -u root -p < database/schema.sql
```

Update credentials in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/resource_leave_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

---

### 2. Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend runs at: `http://localhost:8080`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 🔐 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | admin123 |
| Manager | manager@company.com | manager123 |
| Employee | employee@company.com | emp123 |

> **Note:** Register via the Register page or via curl after starting the app:

```bash
# Admin
curl -X POST http://localhost:8080/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@company.com","password":"admin123","role":"ADMIN"}'

# Manager
curl -X POST http://localhost:8080/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Manager Smith","email":"manager@company.com","password":"manager123","role":"MANAGER"}'

# Employee
curl -X POST http://localhost:8080/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Employee","email":"employee@company.com","password":"emp123","role":"EMPLOYEE"}'
```

---

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/register` | Public |
| POST | `/api/login` | Public |
| GET | `/api/profile` | Authenticated |

### Projects
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/projects` | All |
| POST | `/api/projects` | Admin/Manager |
| PUT | `/api/projects/{id}` | Admin/Manager |
| DELETE | `/api/projects/{id}` | Admin |

### Leave
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/leave/apply` | Employee |
| GET | `/api/leave/my` | Employee |
| GET | `/api/leave/all` | Admin/Manager |
| PUT | `/api/leave/{id}/approve` | Admin/Manager |
| PUT | `/api/leave/{id}/reject` | Admin/Manager |

### Assignments & Users & Dashboard
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/assign-project` | Admin/Manager |
| GET | `/api/employee-projects` | All |
| GET | `/api/users` | Admin |
| GET | `/api/users/employees` | Admin/Manager |
| DELETE | `/api/users/{id}` | Admin |
| GET | `/api/dashboard/admin` | Admin |
| GET | `/api/dashboard/manager` | Admin/Manager |
| GET | `/api/dashboard/employee` | All |

---

## 🏗️ Database Relationships

```
users
  └──< leave_requests        (one-to-many, via employee_id)
  └──< employee_projects >── projects   (many-to-many junction)
```

---

## 📝 Write-Up Answers

### 1. Relationship between users, projects, and leave_requests
A `User` has many `LeaveRequest` records (one-to-many via `employee_id`). Users and Projects share a many-to-many relationship resolved through the `EmployeeProject` junction table, which adds `assigned_date`. Leave is independent of project assignment — it tracks absence, not allocation.

### 2. How RBAC is implemented
Each User has a `role` enum (ADMIN/MANAGER/EMPLOYEE). On login, a JWT is issued. Spring Security reads the role on every request. `@PreAuthorize` annotations and `SecurityConfig` URL rules enforce server-side access. The frontend uses `ProtectedRoute` with `allowedRoles` and role-filtered sidebar navigation.

### 3. How employees are restricted from manager/admin functionality
Backend: Spring Security returns `403 Forbidden` for unauthorized roles — this is the true enforcement layer. Frontend: `ProtectedRoute` redirects unauthorized role attempts, and role-filtered navigation hides inaccessible menu items.

### 4. Validations before approving a leave request
The leave must exist (404 otherwise). It must be in `PENDING` status — processing an already-decided request returns 400. Date validation at apply-time ensures `endDate >= startDate`. All fields validated via `@NotNull`/`@NotBlank` at DTO level. Frontend mirrors these validations for instant feedback.

### 5. Which module to optimize first at scale
The **Leave Request module** (`GET /api/leave/all`). Optimizations: DB indexes on `employee_id`, `status`, `applied_at`; Redis caching for dashboard aggregates; pagination already in place; async notifications via message queue; read replicas for reporting queries.

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, React Router v6, Axios, Recharts, React-Toastify |
| Backend | Java 17, Spring Boot 3.2, Spring Security, JWT (jjwt 0.11.5) |
| Database | MySQL 8 with Spring Data JPA / Hibernate |
| Auth | JWT Bearer tokens (HS512) |
