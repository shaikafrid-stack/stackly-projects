# Task 23 — Dataset & Metadata Management Module

A full-stack, role-based application for registering datasets, managing metadata,
organizing datasets into workspaces, and tracking dataset versions and ownership.

**Stack:** React.js + Tailwind CSS (frontend) · Node.js + Express (backend) · MySQL (database)

---

## 1. Project Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm

### Backend

```bash
cd backend
cp .env.example .env      # then edit .env with your MySQL credentials + a JWT secret
npm install
```

Create the database and tables (see section 2), then seed demo data:

```bash
npm run seed        # creates the 3 demo users + 2 demo workspaces with correctly hashed passwords
npm run dev          # starts on http://localhost:5000 (or `npm start` for production mode)
```

### Frontend

```bash
cd frontend
cp .env.example .env      # points to the backend API (defaults to http://localhost:5000/api)
npm install
npm run dev          # starts on http://localhost:5173
```

Open `http://localhost:5173` in your browser and log in with one of the test credentials below.

---

## 2. Database Configuration

1. Log into MySQL and run the schema:
   ```bash
   mysql -u root -p < backend/schema.sql
   ```
   This creates the `task23_dataset_mgmt` database and all six tables (`users`, `workspaces`,
   `datasets`, `dataset_tags`, `dataset_activity`, plus `dataset_favorites` for the optional
   favorites feature), along with indexes used for search/filter performance.

2. Seed demo data (either method works):
   - **Recommended:** `cd backend && npm run seed` — hashes the demo password correctly at
     insert time.
   - **Alternative:** `mysql -u root -p task23_dataset_mgmt < backend/seed.sql` — uses a
     pre-computed bcrypt hash for `Password@123` and also adds sample workspaces/datasets/tags/
     activity history so the dashboard and lists aren't empty on first login.

3. Update `backend/.env` with your `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.

### Test Credentials
(password is the same for all three — `Password@123`)

| Role               | Email                | Password      |
|--------------------|-----------------------|---------------|
| Administrator      | admin@task23.com      | Password@123  |
| Data Steward       | steward@task23.com    | Password@123  |
| Data Analyst       | analyst@task23.com    | Password@123  |

---

## 3. API Endpoints

All routes except `/api/login` require `Authorization: Bearer <token>`.

### Authentication
| Method | Endpoint            | Access        | Description              |
|--------|----------------------|---------------|---------------------------|
| POST   | `/api/login`          | Public        | Login, returns JWT + user |
| GET    | `/api/profile`        | Authenticated | Current user's profile    |

### Datasets
| Method | Endpoint                          | Access                          | Description                          |
|--------|-------------------------------------|----------------------------------|----------------------------------------|
| GET    | `/api/datasets`                     | Authenticated                    | List with search/filter/pagination (`search, category, status, owner_id, workspace_id, page, limit`) |
| GET    | `/api/datasets/:id`                 | Authenticated                    | Dataset details incl. tags            |
| POST   | `/api/datasets`                     | Administrator, Data Steward      | Register a new dataset                |
| PUT    | `/api/datasets/:id`                 | Administrator, Data Steward      | Update metadata (optionally bump version via `bumpVersion: true`) |
| DELETE | `/api/datasets/:id`                 | Administrator, Data Steward      | Archive (soft-delete)                 |
| POST   | `/api/datasets/:id/restore`         | Administrator                    | Restore an archived dataset           |
| POST   | `/api/datasets/:id/favorite`        | Authenticated                    | Toggle favorite (optional feature)    |
| GET    | `/api/datasets/favorites/mine`      | Authenticated                    | Current user's favorited datasets     |

### Workspaces
| Method | Endpoint               | Access         | Description             |
|--------|--------------------------|-----------------|---------------------------|
| GET    | `/api/workspaces`        | Authenticated   | List all workspaces       |
| POST   | `/api/workspaces`        | Administrator   | Create a workspace        |
| PUT    | `/api/workspaces/:id`    | Administrator   | Update / assign a steward |

### Tags
| Method | Endpoint                                | Access                        |
|--------|--------------------------------------------|--------------------------------|
| GET    | `/api/datasets/:id/tags`                    | Authenticated                  |
| POST   | `/api/datasets/:id/tags`                    | Administrator, Data Steward    |
| DELETE | `/api/datasets/:id/tags/:tagId`             | Administrator, Data Steward    |

### Activity / Version History
| Method | Endpoint                        | Access        |
|--------|-----------------------------------|----------------|
| GET    | `/api/datasets/:id/activity`      | Authenticated  |

### Dashboards
| Method | Endpoint                  | Access                                     |
|--------|-----------------------------|-----------------------------------------------|
| GET    | `/api/dashboard/admin`      | Administrator                                  |
| GET    | `/api/dashboard/steward`    | Administrator, Data Steward                    |
| GET    | `/api/dashboard/analyst`    | Administrator, Data Steward, Data Analyst      |

### Users *(extension, needed for the Admin's User Assignment page)*
| Method | Endpoint            | Access        |
|--------|-----------------------|----------------|
| GET    | `/api/users`           | Administrator  |
| PUT    | `/api/users/:id`       | Administrator  |

---

## 4. Folder Structure

```
task23/
├── backend/
│   ├── config/
│   │   ├── db.js               # MySQL connection pool
│   │   └── seed.js             # programmatic demo-data seeder
│   ├── controllers/            # one file per resource
│   ├── middleware/
│   │   ├── auth.js             # JWT verification
│   │   └── role.js             # role-based authorization
│   ├── routes/                 # one file per resource, mounted in server.js
│   ├── schema.sql              # full DB schema + indexes
│   ├── seed.sql                # sample data (users/workspaces/datasets/tags/activity)
│   ├── server.js               # app entrypoint
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/axios.js        # axios instance + auth interceptor
    │   ├── context/AuthContext.jsx
    │   ├── components/         # reusable UI: Button, FormInput, Modal, ConfirmDialog,
    │   │                       #   Table, Pagination, StatusBadge, SummaryCard, Sidebar,
    │   │                       #   Navbar, ProtectedRoute
    │   ├── pages/
    │   │   ├── Login.jsx, Dashboard.jsx, Profile.jsx, Forbidden.jsx
    │   │   ├── admin/           # Workspace Management, Dataset Overview, User Assignment
    │   │   ├── steward/         # Dataset Management, Metadata Editor, Version History, Activity Log
    │   │   └── analyst/         # Dataset Explorer, Dataset Details, Search & Filter, Favorites
    │   ├── App.jsx              # route definitions + role-based route guarding
    │   └── main.jsx
    ├── tailwind.config.js
    ├── .env.example
    └── package.json
```

---

## 5. Write-Up Questions

**Q1. Relationship between Workspaces, Datasets, Dataset Tags, and Dataset Activity**
A `workspace` is a container that groups related `datasets` (one-to-many: `datasets.workspace_id`
→ `workspaces.id`). Each `dataset` can have many `dataset_tags` (one-to-many, `dataset_tags.dataset_id`)
for flexible categorization/search, and many `dataset_activity` rows (one-to-many) that form an
append-only audit trail of every metadata change, status change, and version bump, each attributed
to the acting `user`. Deleting a workspace cascades to its datasets; deleting a dataset cascades to
its tags and activity rows.

**Q2. Role-based access control**
JWT payloads carry the user's `role`. An `authenticate` middleware verifies the token on every
protected route; an `authorize(...roles)` middleware then checks `req.user.role` against an
allow-list per route (e.g. only `Administrator`/`Data Steward` can `POST`/`PUT` datasets; only
`Administrator` can restore archived datasets or manage users). On the frontend, `ProtectedRoute`
mirrors this by redirecting unauthenticated users to `/login` and unauthorized users to `/403`, and
the `Sidebar` only renders links for the current role — so both API and UI enforce the same rules
independently (defense in depth).

**Q3. Dataset versioning and metadata updates**
Every dataset carries a `version` string (e.g. `v1.2`). Metadata edits are simple updates; when a
Data Steward opts to "bump version" on save, the backend increments the minor version and writes a
`dataset_activity` row describing the change and the resulting version, giving a lightweight but
complete version + change history without needing to store full document snapshots.

**Q4. Reusable frontend components**
`Table`, `Pagination`, `FormInput`, `Modal`, `ConfirmDialog`, `Button`, `StatusBadge`, and
`SummaryCard` are shared across every admin/steward/analyst page. This cut duplicated markup
significantly, gave consistent styling/validation/loading states for free, and means a UI-wide
change (e.g. new status color) only needs to happen in one file.

**Q5. Scaling to millions of datasets + advanced metadata search**
- Move search from `LIKE` queries to a dedicated search engine (Elasticsearch/OpenSearch or MySQL
  full-text indexes) for fast, ranked, typo-tolerant metadata search.
- Introduce read replicas / caching (Redis) for dashboard aggregates so they aren't recomputed on
  every request.
- Partition/shard the `datasets` and `dataset_activity` tables (e.g. by workspace or time) once
  activity history grows large.
- Move dataset activity to an append-only event store or log (e.g. Kafka) with periodic
  materialized-view rebuilds for dashboards.
- Add async job processing for expensive operations (bulk imports, re-indexing) instead of doing
  them inline in request handlers.
- Introduce API-level cursor pagination instead of offset pagination once tables grow past a few
  million rows, since `OFFSET` gets slow at scale.

---

## 6. Notes on Screenshots & Demo Video

This deliverable includes the full source code, schema, and README. Screenshots (Login, Dashboard,
Dataset List, Dataset Details, Metadata Editor, Version History, Analytics Dashboard) and the 5–7
minute demo video should be captured by you after running the app locally (or after deployment),
since these are visual artifacts of a live running instance.
