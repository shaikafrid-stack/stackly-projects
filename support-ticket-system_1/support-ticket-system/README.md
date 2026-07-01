# Customer Support Ticket & SLA Management System

A full-stack support ticketing platform with role-based workflows for **Admins**, **Support Agents**, and **Customers**, including SLA tracking, ticket lifecycle management, and an analytics dashboard.

**Stack:** React.js + Tailwind CSS (frontend) · Node.js + Express + Sequelize (backend) · MySQL (database)

---

## Folder Structure

```
support-ticket-system/
├── backend/
│   ├── config/database.js          # Sequelize MySQL connection
│   ├── controllers/                # Route handlers (auth, ticket, comment, sla, dashboard, user)
│   ├── middlewares/auth.js         # JWT auth + role-based authorization
│   ├── models/                     # Sequelize models (User, Ticket, TicketComment, SLATracking, ActivityLog)
│   ├── routes/                     # Express routers
│   ├── utils/
│   │   ├── slaHelper.js            # SLA deadline calculation & breach checks
│   │   ├── activityLogger.js       # Writes to activity_logs table
│   │   └── seed.js                 # Seeds demo users + tickets
│   ├── server.js                   # App entrypoint
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── auth/                # Login, Register
    │   │   ├── customer/            # Dashboard, CreateTicket, MyTickets
    │   │   ├── agent/                # Dashboard, AgentTickets
    │   │   ├── admin/               # Dashboard, AdminTickets, SLAMonitor, UserManagement, Analytics
    │   │   └── TicketDetail.js      # Shared ticket view + comments (all roles)
    │   ├── components/common/       # Layout, StatusBadge, Skeleton, Pagination
    │   ├── context/AuthContext.js   # Auth state + token handling
    │   └── services/api.js          # Axios instance + API calls
    ├── tailwind.config.js
    └── package.json
```

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- MySQL 8+

### 1. Clone & install

```bash
git clone <your-repo-url>
cd support-ticket-system

cd backend && npm install
cd ../frontend && npm install
```

### 2. Database Setup

Create the database in MySQL:

```sql
CREATE DATABASE support_ticket_db;
```

Copy the env file and fill in your MySQL credentials:

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=support_ticket_db
DB_USER=root
DB_PASSWORD=yourpassword
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
```

> Tables (`users`, `tickets`, `ticket_comments`, `sla_tracking`, `activity_logs`) are auto-created on server start via Sequelize `sync()`.

### 3. Seed demo data (optional but recommended)

```bash
cd backend
node utils/seed.js
```

This drops & recreates all tables, then inserts demo users and sample tickets with SLA records.

### 4. Run the backend

```bash
cd backend
npm run dev      # nodemon, or
npm start         # plain node
```

Backend runs on `http://localhost:5000`.

### 5. Run the frontend

```bash
cd frontend
npm start
```

Frontend runs on `http://localhost:3000` and proxies `/api` calls to the backend automatically.

---

## Test Credentials

| Role     | Email                | Password      |
|----------|-----------------------|---------------|
| Admin    | admin@support.com     | Admin@123     |
| Agent    | alice@support.com     | Agent@123     |
| Agent    | bob@support.com       | Agent@123     |
| Customer | john@example.com      | Customer@123  |
| Customer | jane@example.com      | Customer@123  |

You can also register new accounts directly from the `/register` page and choose a role.

---

## API Reference

### Auth
- `POST /api/register` — Register a new user
- `POST /api/login` — Log in, returns JWT
- `GET /api/profile` — Get current user (auth required)

### Tickets
- `POST /api/tickets` — Create ticket (customer)
- `GET /api/tickets` — List tickets (filtered by role, supports `search`, `status`, `priority`, `page`, `limit`)
- `GET /api/tickets/:id` — Get ticket detail
- `PUT /api/tickets/:id` — Update ticket (admin: full edit; agent: status only)
- `DELETE /api/tickets/:id` — Delete ticket (admin)

### Comments
- `POST /api/tickets/:id/comment` — Add comment
- `GET /api/tickets/:id/comments` — List comments

### SLA
- `GET /api/sla` — List all SLA records with breach status (admin)
- `PUT /api/sla/:ticket_id` — Manually update SLA record (admin)

### Dashboards
- `GET /api/dashboard/admin` — Org-wide stats, charts data, recent activity
- `GET /api/dashboard/agent` — Agent's assigned ticket stats
- `GET /api/dashboard/customer` — Customer's own ticket stats

### Users (admin only)
- `GET /api/users` — List all users
- `GET /api/users/agents` — List agents (for ticket assignment)
- `PUT /api/users/:id` — Update user role
- `DELETE /api/users/:id` — Delete user

---

## SLA Rules

SLA deadlines are auto-calculated on ticket creation based on priority:

| Priority | Response SLA | Resolution SLA |
|----------|---------------|------------------|
| Critical | 1 hour        | 4 hours          |
| High     | 4 hours       | 24 hours         |
| Medium   | 8 hours       | 48 hours         |
| Low      | 24 hours      | 72 hours         |

Breach status is recalculated whenever the SLA dashboard is viewed.

---

## Features Implemented

- JWT authentication with role-based protected routes (admin / agent / customer)
- Full ticket lifecycle: Open → In Progress → On Hold → Resolved → Closed
- Priority levels: Low, Medium, High, Critical
- SLA auto-tracking with breach detection
- Activity logging for auditability
- Ticket comments/resolution notes
- Search, filter (status/priority), and pagination on ticket lists
- Form validation, toast notifications, loading skeletons, responsive layout
- Analytics dashboard (Recharts): tickets by status, tickets by priority, SLA breach %, agent-wise resolutions, monthly trends

---

## Screenshots

> Add screenshots here after running the app locally:
- `screenshots/login.png`
- `screenshots/ticket-creation.png`
- `screenshots/ticket-assignment.png`
- `screenshots/sla-dashboard.png`
- `screenshots/analytics-dashboard.png`
- `screenshots/ticket-resolution.png`

## Demo Video

> Add a link here to a short demo covering: Customer ticket flow → Agent resolution flow → Admin monitoring flow.
