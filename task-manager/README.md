# Task Management System

A full-stack Task Management System that lets users register, log in, and create, update, and track their daily tasks through a clean, responsive interface.

**Stack**
- Frontend: React (Vite) + Tailwind CSS + React Router + Axios
- Backend: Node.js + Express
- Database: MySQL
- Auth: JWT (JSON Web Tokens) + bcrypt password hashing

---

## 1. Project Structure

```
task-manager/
├── backend/                 # Express REST API
│   ├── config/db.js         # MySQL connection pool
│   ├── controllers/         # Route handler logic (auth, tasks)
│   ├── middleware/          # JWT auth guard + error handler
│   ├── routes/               # Express routers
│   ├── schema.sql           # Database schema (users, tasks)
│   ├── server.js            # App entry point
│   └── .env.example
└── frontend/                 # React + Tailwind SPA
    ├── src/
    │   ├── api/axios.js      # Axios instance with auth interceptor
    │   ├── components/       # Navbar, TaskCard, TaskForm, ProtectedRoute, etc.
    │   ├── context/AuthContext.jsx
    │   ├── pages/             # Login, Register, Dashboard, TaskList, CreateTask, EditTask
    │   └── App.jsx
    └── .env.example
```

---

## 2. Prerequisites

- Node.js 18+
- MySQL 8+ (or MySQL 5.7+)
- npm

---

## 3. Database Configuration

1. Start your MySQL server.
2. Create the database and tables using the provided schema:

```bash
mysql -u root -p < backend/schema.sql
```

This creates the `task_manager` database with two tables:

**users**
| Column     | Type                |
|------------|---------------------|
| id         | INT, PK, AUTO_INCREMENT |
| name       | VARCHAR(100)        |
| email      | VARCHAR(150), UNIQUE |
| password   | VARCHAR(255) (bcrypt hash) |
| created_at | TIMESTAMP           |

**tasks**
| Column      | Type                                        |
|-------------|----------------------------------------------|
| id          | INT, PK, AUTO_INCREMENT                      |
| title       | VARCHAR(255)                                  |
| description | TEXT                                          |
| priority    | ENUM('Low','Medium','High')                   |
| due_date    | DATE                                          |
| status      | ENUM('Pending','In Progress','Completed')     |
| user_id     | INT, FK → users.id (ON DELETE CASCADE)        |
| created_at  | TIMESTAMP                                     |
| updated_at  | TIMESTAMP                                     |

---

## 4. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your MySQL credentials and a JWT secret:

```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=task_manager
JWT_SECRET=replace_this_with_a_long_random_secret_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Run the server:

```bash
npm run dev     # with nodemon (auto-restart)
# or
npm start
```

The API will be available at `http://localhost:5000/api`. Check `GET /api/health` to confirm it's running.

---

## 5. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

`.env` should point to your backend:

```
VITE_API_URL=http://localhost:5000/api
```

Run the dev server:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

---

## 6. Test User Credentials

No user is seeded by default — register a new account from the **Sign Up** page on first run. Suggested test credentials to use:

```
Name:     Test User
Email:    test@example.com
Password: Test@1234
```

---

## 7. Features Implemented

**Authentication**
- User registration with hashed passwords (bcrypt)
- Login with JWT issuance
- Logout (clears client-side token)
- Protected routes on the frontend (redirects to `/login` if not authenticated) and protected API routes on the backend (JWT middleware)

**Task Management (CRUD)**
- Create, view, edit, and delete tasks
- Each task has: title, description, priority (Low/Medium/High), due date, and status (Pending/In Progress/Completed)
- Inline status updates from both the Dashboard and Task List

**Dashboard**
- Total, Pending, In Progress, and Completed task counts
- Recent tasks preview

**Search, Filter & Sort**
- Search tasks by title (debounced)
- Filter by status
- Filter by priority
- Sort by due date (ascending/descending)

**UX / Quality**
- Fully responsive layout (mobile, tablet, desktop) via Tailwind CSS
- Client-side form validation (required fields, email format, password length/match)
- Loading indicators for async operations
- Centralized API error handling with user-facing messages
- Reusable component structure (`TaskForm`, `TaskCard`, `StatCard`, `Badges`, `Navbar`, `ProtectedRoute`, `Loader`)

---

## 8. API Reference

**Auth**
| Method | Endpoint         | Description        |
|--------|------------------|---------------------|
| POST   | /api/register    | Register a new user |
| POST   | /api/login       | Log in, returns JWT |

**Tasks** (require `Authorization: Bearer <token>` header)
| Method | Endpoint          | Description                                             |
|--------|-------------------|-----------------------------------------------------------|
| GET    | /api/tasks        | List tasks (supports `search`, `status`, `priority`, `sortBy`, `order`) |
| GET    | /api/tasks/:id    | Get a single task                                          |
| POST   | /api/tasks        | Create a task                                               |
| PUT    | /api/tasks/:id    | Update a task                                                |
| DELETE | /api/tasks/:id    | Delete a task                                                |

---

## 9. Pushing to GitHub

```bash
cd task-manager
git init
git add .
git commit -m "Initial commit: Task Management System"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

---

## 10. Screenshots & Demo Video

Add screenshots of the Login, Dashboard, Task List, Create Task, and Edit Task pages to a `/screenshots` folder in this repo, and link your demo video here once recorded.
