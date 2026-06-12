# WorkSpace Portal

A TypeScript-based Multi-Tenant Workspace Management Portal with Authentication, Role-Based Access Control (RBAC), Dashboard Modules, User Administration, and Activity Tracking.

## 🚀 Setup Instructions

### Prerequisites
- Node.js 16+ 
- npm 7+

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd workspace-portal

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
```

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | alex@workspace.io | admin123 |
| Project Manager | maria@workspace.io | pm123 |
| Team Lead | james@workspace.io | lead123 |
| Team Member | priya@workspace.io | member123 |
| Viewer | lucas@workspace.io | view123 |

> Use the **Quick Access** buttons on the login page for fast demo login.

---

## 📁 Folder Structure

```
src/
├── types/
│   └── index.ts              # All TypeScript interfaces & types
├── context/
│   ├── AuthContext.tsx        # Auth state, login/logout, session restoration
│   └── AppContext.tsx         # App-wide state: users, projects, activities, theme
├── hooks/
│   └── index.ts              # usePermissions, usePagination, useSearch
├── pages/
│   ├── Login.tsx             # Login page with form validation
│   ├── Dashboard.tsx         # Role-aware dashboard with charts
│   ├── Users.tsx             # User management (CRUD + search/filter/pagination)
│   ├── Projects.tsx          # Project management (CRUD + search/filter)
│   ├── ActivityLog.tsx       # Activity logs with CSV export
│   └── Profile.tsx           # User profile management
├── components/
│   ├── layout/
│   │   ├── Layout.tsx        # Shell: sidebar + header + main
│   │   ├── Sidebar.tsx       # Collapsible sidebar with RBAC nav
│   │   ├── Header.tsx        # Top bar with theme toggle + notifications
│   │   └── ProtectedRoute.tsx # Auth & role guard
│   └── ui/
│       └── index.tsx         # Shared UI: Badge, Avatar, Modal, FormField, Pagination, etc.
├── utils/
│   ├── helpers.ts            # formatDate, exportToCSV, filterBySearch, paginate, etc.
│   ├── mockData.ts           # Seed data: users, projects, activities, dashboard stats
│   └── validation.ts        # Zod schemas for login, user, project forms
├── constants/
│   └── index.ts             # PERMISSIONS map, ROLE_LABELS, color constants
├── App.tsx                  # Router setup with protected routes
└── index.tsx                # Entry point
```

---

## ✅ Features Implemented

### Must-Have
- **Authentication** — Login form, logout, session persistence via localStorage
- **Protected Routes** — Role-aware route guards redirect unauthorized users
- **Role-Based Access Control** — 5 roles with distinct permissions, sidebar menus, and route access
- **Dynamic Sidebar** — Collapses, shows only permitted nav items per role
- **User Management** — Add, edit, deactivate users with search, role/status filters, pagination
- **Project Management** — Add, edit, delete projects with search, status/priority filters, pagination
- **Activity Logs** — Full audit trail with search, filters (action/module/status), CSV export
- **Context API + useReducer** — AuthContext and AppContext manage all state
- **React Hook Form + Zod** — Form validation on login, user creation, project creation
- **TypeScript throughout** — Typed interfaces, contexts, reducers, components; no `any`
- **Search, Filter & Pagination** — All data tables have search, multi-filter, and page controls
- **CSV Export** — Activity log export with filename + date
- **Responsive Design** — Works on mobile, tablet, and desktop

### Good-to-Have (also implemented)
- **Dark / Light Theme Toggle** — Persisted to localStorage, applied via Tailwind `dark:` classes
- **Toast Notifications** — react-hot-toast for all CRUD and auth events
- **Collapsible Sidebar** — Chevron toggle, icon-only collapsed mode
- **Dashboard Charts** — Recharts AreaChart (monthly activity) + PieChart (project status)
- **Profile Management** — Edit name and department, view activity history

---

## 🔑 Role Permissions

| Permission | Super Admin | Project Manager | Team Lead | Team Member | Viewer |
|---|:---:|:---:|:---:|:---:|:---:|
| View Users | ✅ | ✅ | ✅ | ❌ | ❌ |
| Add/Edit Users | ✅ | ✅ | ❌ | ❌ | ❌ |
| Deactivate Users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create Projects | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit Projects | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete Projects | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Activity Log | ✅ | ✅ | ❌ | ❌ | ❌ |
| Export CSV | ✅ | ✅ | ❌ | ❌ | ❌ |
| View All Data | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Roles | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🧩 Technical Stack

| Technology | Usage |
|---|---|
| React 19 + TypeScript | Component framework |
| Tailwind CSS v3 | Styling & dark mode |
| React Router DOM v6 | Client-side routing |
| Context API + useReducer | State management |
| React Hook Form | Form state & submission |
| Zod (v3 API) | Schema validation |
| Recharts | Dashboard charts |
| react-hot-toast | Toast notifications |
| lucide-react | Icons |
| localStorage | Session & data persistence |

---

## 💡 Assumptions Made

1. **No backend** — All data is mock data seeded from `mockData.ts` and persisted in localStorage.
2. **Password handling** — Passwords are stored in the mock array in plaintext for demo purposes only. In production, these would be hashed.
3. **Session security** — Session is stored in localStorage as a plain JSON object. For production, use secure HTTP-only cookies or JWTs.
4. **Role immutability** — A user cannot change their own role via the profile page; only Super Admins can change roles via User Management.
5. **Activity timestamps** — Pre-seeded activities use fixed 2024 dates; new activities use real `Date.now()`.
6. **Zod version** — The project uses Zod v4 (installed) but imports from `zod/v3` subpath for backwards-compatible API signatures.
7. **Pagination resets** — Changing search/filter resets to page 1 automatically.
8. **Viewers** — Viewer role can see Projects list in read-only mode; cannot create/edit/delete.
