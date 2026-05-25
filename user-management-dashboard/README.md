# 🛡️ AdminForge — User Management Dashboard

A responsive, production-grade **User Management Dashboard** built with **React.js** and **Tailwind CSS**, featuring full CRUD functionality, API integration, and a polished dark-mode UI.

---

## ✨ Features

- **User Listing Table** — sortable columns, pagination, search, role/status filters
- **Add User** — inline quick-add form + modal with full validation
- **Edit User** — pre-filled modal form with live updates
- **Delete User** — inline confirmation guard to prevent accidental deletes
- **Stats Cards** — live aggregate counts (Total / Active / Inactive / Pending)
- **API Integration** — fetches from [JSONPlaceholder Users API](https://jsonplaceholder.typicode.com/users), enriched with roles and statuses
- **Responsive Design** — works on mobile, tablet, and desktop
- **Collapsible Sidebar** — toggleable via the header menu button
- **Skeleton Loaders** — smooth loading states for table and stat cards
- **Global Search** — real-time filtering across name and email fields
- **Role & Status Filters** — dropdown filters on the table toolbar

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 (Vite) |
| Styling | Tailwind CSS v3 |
| Icons | Lucide React |
| State | React Context + useReducer |
| API | JSONPlaceholder (REST) |
| Fonts | Sora + JetBrains Mono (Google Fonts) |
| Build | Vite |

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/user-management-dashboard.git
cd user-management-dashboard

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open http://localhost:5173 in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Folder Structure

```
user-management-dashboard/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx       # Collapsible sidebar navigation
│   │   │   ├── Header.jsx        # Top navbar with search
│   │   │   └── Dashboard.jsx     # Main page container
│   │   ├── users/
│   │   │   ├── StatsCards.jsx    # Aggregate stat cards
│   │   │   ├── UserTable.jsx     # Sortable paginated table
│   │   │   └── UserForm.jsx      # Add/Edit form with validation
│   │   └── ui/
│   │       ├── Badge.jsx         # StatusBadge, RoleBadge, Avatar
│   │       └── Modal.jsx         # Reusable modal wrapper
│   ├── context/
│   │   └── UserContext.jsx       # Global state via Context + useReducer
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── tailwind.config.js
├── vite.config.js
├── package.json
└── README.md
```

---

## 🧩 Component Overview

### UserContext (Context + useReducer)
Central state. Handles fetch, CRUD, search/filter, and derived stats.

### UserTable
Sortable by all columns, paginated (6/page), with inline delete confirmation and filter dropdowns.

### UserForm
Controlled form with validation, works in Add and Edit modes, reused inline and inside modals.

### StatsCards
Reads context stats, shows skeleton loaders, gradient color-coded by status.

---

## 🌐 API

**GET** `https://jsonplaceholder.typicode.com/users`  
Users are enriched client-side with `role` and `status` fields.  
Newly added users are stored in React state (no backend persistence).

---

## 📝 License

MIT
