# ⚡ NEXUS — Admin Dashboard

A responsive Admin Dashboard with Authentication, Protected Routes, and Analytics, built with **React.js + Tailwind CSS**.

## 🔐 Demo Login
| Field | Value |
|---|---|
| Email | `admin@nexus.io` |
| Password | `admin123` |

## 🚀 Features
- **Authentication** — Login with form validation, localStorage session, protected routes
- **Dashboard** — Stat cards, revenue area chart, orders bar chart, recent users table
- **User Management** — Full table, search by name/email, filter by company & status
- **Products** — Grid view, search, category filter, ratings
- **Analytics** — Area, Pie, and Line charts with Recharts
- **Settings** — Profile, notifications, security

## 🛠️ Tech Stack
React 18 · Vite · React Router DOM v6 · Tailwind CSS v4 · Recharts · Lucide React

## 📁 Folder Structure
```
src/
├── components/
│   ├── layout/         # DashboardLayout, Navbar, Sidebar
│   ├── ui/             # StatCard, LoadingSpinner, ErrorBox, Badge
│   └── ProtectedRoute.jsx
├── context/AuthContext.jsx
├── hooks/useApi.js
└── pages/              # Login, Dashboard, Users, Products, Analytics, Settings
```

## ⚙️ Getting Started
```bash
npm install
npm run dev       # dev server
npm run build     # production build
```

## 🌐 APIs Used
- Users: https://jsonplaceholder.typicode.com/users
- Products: https://fakestoreapi.com/products
