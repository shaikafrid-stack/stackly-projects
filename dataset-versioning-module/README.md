# 📊 DataLineage — Dataset Versioning, Lineage & Change Tracking Module

*Task 27 — Full-stack module for maintaining multiple dataset versions, tracking changes between them, and visualizing lineage.*

![status](https://img.shields.io/badge/status-complete-brightgreen) ![stack](https://img.shields.io/badge/stack-React%20%7C%20Node.js%20%7C%20MySQL-blue) ![license](https://img.shields.io/badge/license-MIT-lightgrey)

---

## 1. Overview

DataLineage lets a team maintain a full, non-destructive version history of a dataset: every edit creates a **new** version rather than mutating an old one, every structural or data change is logged at field-level granularity, two versions can be diffed side-by-side, and the full derivation chain (lineage) of a dataset can be visualized end-to-end. A previous version can be restored without losing any newer work.

Built on top of the concepts from the earlier dataset preparation / transformation tasks in this series.

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite) + Tailwind CSS + React Router + Axios |
| Backend | Node.js + Express (REST API) |
| Database | MySQL 8 |
| Auth | JWT with role claims (demo login) |
| Version Control | Git (feature branch workflow, see §8) |

> A Java Spring Boot backend was an allowed alternative per the brief; Node/Express was chosen here for a single-language (JS) full stack, faster iteration, and because the versioning logic is primarily data-shape/diff work rather than heavy enterprise business logic — see §7 for the full rationale.

## 3. Project Structure

```
dataset-versioning-module/
├── backend/
│   ├── src/
│   │   ├── config/db.js              # MySQL connection pool
│   │   ├── controllers/              # Request handlers (business logic)
│   │   ├── routes/                   # Express routers
│   │   ├── middleware/               # auth (JWT + RBAC), error handling
│   │   ├── utils/diffEngine.js       # Version comparison / diff logic
│   │   └── server.js                 # App entry point
│   ├── database/
│   │   ├── schema.sql                # DDL for all tables
│   │   └── seed.sql                  # Demo data (2 datasets, 4 versions, change log)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/api.js                # Axios service layer
│   │   ├── context/AuthContext.jsx   # Auth/role state
│   │   ├── components/               # Navbar, Sidebar, StatusBadge, ConfirmModal, Loader…
│   │   ├── pages/                    # Dashboard, DatasetList, VersionHistory, Compare, Lineage…
│   │   └── App.jsx                   # Routing & layout
│   ├── tailwind.config.js
│   └── package.json
├── docs/
│   └── API_DOCUMENTATION.md
└── README.md   (this file)
```

## 4. Getting Started

### Prerequisites
- Node.js ≥ 18
- MySQL ≥ 8
- npm

### 4.1 Database Setup
```bash
mysql -u root -p < backend/database/schema.sql
mysql -u root -p < backend/database/seed.sql
```

### 4.2 Backend Setup
```bash
cd backend
cp .env.example .env     # fill in DB_USER / DB_PASSWORD / JWT_SECRET
npm install
npm run dev               # starts on http://localhost:5000
```

### 4.3 Frontend Setup
```bash
cd frontend
npm install
npm run dev               # starts on http://localhost:5173 (proxies /api to :5000)
```

### 4.4 Demo Logins
| Role | Username | Password | Permissions |
|---|---|---|---|
| Admin | `admin` | `admin123` | View, create, restore & manage all versions |
| Data Steward | `steward` | `steward123` | Create, compare & manage versions |
| Data Analyst | `analyst` | `analyst123` | View & compare versions only |

## 5. Architecture Overview

```
┌──────────────┐      HTTPS/JSON      ┌──────────────────┐      SQL       ┌───────────┐
│  React SPA   │ ───────────────────▶ │  Express REST API │ ─────────────▶ │  MySQL DB │
│ (Vite+Tailw.)│ ◀─────────────────── │  (Node.js)         │ ◀───────────── │           │
└──────────────┘     JWT bearer       └──────────────────┘                └───────────┘
```

- **Frontend** is a pure SPA; all state comes from the REST API. Role is embedded in the JWT and read client-side via `AuthContext` to conditionally render admin/steward-only actions — the **backend independently re-checks the role on every mutating route**, since a client-side check is only a UX convenience, not a security boundary.
- **Backend** follows a classic `routes → middleware → controllers → db` layering. All version-creating/mutating operations run inside a MySQL transaction (`beginTransaction`/`commit`/`rollback`) so a partially-written version + change-log can never be left behind.
- **Diff engine** (`utils/diffEngine.js`) is a pure, framework-free module: it takes two version rows, parses their `schema_json` snapshot, and returns a structured diff object. Because it has no DB or HTTP dependency, it is directly unit-testable.

## 6. Database Design

Three core tables, exactly as scoped, plus a lightweight `AppUser` table backing role-based auth:

**Dataset** — one row per logical dataset (name, description, status, owner). Never stores content — only metadata.

**DatasetVersion** — one row per version. Key columns:
- `version_number` — monotonically increasing per dataset, enforced via a `UNIQUE(dataset_id, version_number)` constraint (prevents duplicate versions).
- `parent_version_id` — self-referencing FK forming the lineage chain.
- `schema_json` — a JSON snapshot of `{ columns, transformations, validationRules }` at that point in time; this is what the diff engine compares.
- `status` — `Draft | Active | Archived | Restored`. Exactly one version per dataset is `Active` at a time (enforced in application logic when a new version is created).

**DatasetChangeLog** — append-only, one row per discrete change (`COLUMN_ADDED`, `RECORDS_REMOVED`, `STATUS_CHANGED`, `VERSION_RESTORED`, etc.), always attached to the version in which the change occurred. Auto-generated from the diff engine's output whenever a new version is created, so the log and the diff view can never drift apart.

```
Dataset (1) ──< DatasetVersion (N) ──< DatasetChangeLog (N)
                     │
                     └── parent_version_id (self-FK) → lineage chain
```

Full DDL: [`backend/database/schema.sql`](backend/database/schema.sql). Seed data: [`backend/database/seed.sql`](backend/database/seed.sql).

## 7. Versioning Approach & Key Implementation Decisions

1. **Append-only history.** `POST /datasets/:id/versions` never `UPDATE`s an existing `DatasetVersion` row — it inserts a new one with `parent_version_id` pointing at the previous latest version, and flips the previous `Active` version to `Archived`. This means a version's data is immutable once created, which is what makes reliable diffing, auditing, and restore possible.
2. **Change log is derived, not hand-entered.** Rather than trusting the caller to describe what changed, the backend runs the same `compareVersions()` diff engine used by the Compare screen against `(parent, new)` immediately after insert, and materializes the result as `DatasetChangeLog` rows. This guarantees the log and the "Compare Versions" screen are always consistent with each other.
3. **Restore creates a new version, never rewrites history.** `POST /versions/:id/restore` copies the target version's `schema_json`/`record_count` into a brand-new version (status `Restored`, parent = current latest), and logs a `VERSION_RESTORED` entry describing which version it came from. Versions created after the restored one are left untouched in the table — nothing is deleted.
4. **Single active version invariant.** Enforced in the controller layer (inside the same transaction as the insert) rather than a DB trigger, to keep the logic readable and testable in plain JS while MySQL still guarantees atomicity via the transaction.
5. **JWT-based RBAC, enforced server-side.** The frontend hides buttons a role can't use (`useAuth().can(...)`), but every mutating route is wrapped in `authorize('Admin', 'Data Steward')` etc. server-side — the actual authorization boundary.
6. **Node/Express over Spring Boot.** Both were permitted by the brief. Node was chosen for a unified JS/JSX codebase end-to-end, lighter local setup (no JDK/Maven required to run this submission), and because `mysql2`'s native JSON column support maps cleanly onto the `schema_json` snapshot design. The schema and API contract are framework-agnostic — the same `schema.sql` and REST surface could be re-implemented behind Spring Boot without changing the frontend.

## 8. API Summary

All endpoints are prefixed `/api` and (except `/auth/login`) require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose | Roles |
|---|---|---|---|
| POST | `/auth/login` | Obtain JWT | Public |
| GET | `/datasets` | List datasets + active version summary | All |
| POST | `/datasets` | Create dataset (creates v1) | Admin, Steward |
| GET | `/datasets/:id` | Dataset metadata + active version | All |
| GET | `/datasets/:id/versions` | Version history | All |
| POST | `/datasets/:id/versions` | Create new version | Admin, Steward |
| GET | `/versions/:id` | Version details + its change log | All |
| GET | `/versions/compare?versionA=&versionB=` | Compare two versions | All |
| POST | `/versions/:id/restore` | Restore a version as a new version | Admin |
| PATCH | `/versions/:id/status` | Update version status | Admin, Steward |
| GET | `/datasets/:id/change-history` | Full change log for dataset | All |
| GET | `/datasets/:id/lineage` | Lineage graph (nodes + edges) | All |
| GET | `/dashboard/summary` | Dashboard counters & recent activity | All |

Full request/response examples: [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md).

## 9. Validation & Error Handling

Centralized via `AppError` + `errorHandler` middleware, returning `{ success: false, message }` with an appropriate HTTP status:

| Scenario | Status | Handling |
|---|---|---|
| Invalid dataset / version ID | 404 | `fetchVersionOrThrow` / dataset lookup guard |
| Comparing the same version | 422 | Explicit equality check before diffing |
| Restoring the current latest version | 409 | Guard in `restoreVersion` |
| Duplicate version creation | 409 (dataset name) / DB `UNIQUE` constraint (version number) | App-level + DB-level |
| Unauthorized operation | 403 | `authorize()` middleware |
| Missing required fields | 422 | Controller-level checks (`changeSummary`, `name`, etc.) |

The frontend surfaces every one of these as an inline error banner or form-level message — never a silent failure.

## 10. Frontend Pages

| Page | Route | Notes |
|---|---|---|
| Dashboard | `/` | Totals, recently modified datasets, recent changes |
| Dataset List | `/datasets` | Search, create dataset (role-gated) |
| Dataset Overview | `/datasets/:id` | Metadata + active version |
| Version History | `/datasets/:id/versions` | Create version, restore (with confirmation modal) |
| Version Details | `/versions/:id` | Schema snapshot, per-version change log, status control |
| Compare Versions | `/datasets/:id/compare` | Side-by-side structured diff |
| Dataset Lineage | `/datasets/:id/lineage` | Vertical timeline of the derivation chain |
| Change History | `/datasets/:id/changes` | Filterable, dataset-wide change feed |

## 11. Git Practices

Recommended branch flow for review:
```
main
 └── feature/task-27-dataset-versioning
      ├── feat: backend schema + migrations
      ├── feat: version create/compare/restore APIs
      ├── feat: diff engine + change log generation
      ├── feat: frontend pages + routing
      └── docs: README + API documentation
```
Commit messages follow Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`).

## 12. Review Questions — Quick Answers

**How are dataset versions related to each other?**
Via a self-referencing `parent_version_id` on `DatasetVersion`, forming a linked chain (and a branch after a restore) that the lineage endpoint walks to build a node/edge graph.

**How do you identify the differences between two versions?**
`diffEngine.compareVersions()` parses each version's `schema_json` snapshot and structurally diffs columns (added/removed/type-changed), record counts, transformations, validation rules, and status.

**How is dataset lineage represented in your database?**
Implicitly, through `parent_version_id` chains — no separate lineage table is needed; `GET /datasets/:id/lineage` derives the graph on read.

**Why should an old version not be directly overwritten?**
Overwriting would destroy the audit trail, break any diff/compare that references it, and make restore impossible. Immutability is what makes the rest of the module (diffing, lineage, audit) reliable.

**How does the restore operation work?**
It reads the target version's snapshot, inserts it as a brand-new version (status `Restored`, parent = current latest), and logs a `VERSION_RESTORED` change entry — the versions created after the restored one are left in place.

**How do you prevent duplicate or invalid versions?**
A `UNIQUE(dataset_id, version_number)` DB constraint plus application-level checks (dataset/version existence, non-empty change summary) inside a transaction.

**How would your design handle a large number of dataset versions?**
Indexes on `dataset_id`, `status`, and `parent_version_id`; paginated version-history queries (`LIMIT`/`OFFSET` or keyset pagination on `version_number`); and archiving old `schema_json` snapshots to cold storage while keeping metadata rows for lineage.

**How are authorization rules enforced on the backend?**
`authenticate` middleware verifies the JWT; `authorize(...roles)` middleware checks `req.user.role` against an allow-list before the controller runs — independent of anything the frontend hides.

**What happens if a version is restored after several newer versions already exist?**
Those newer versions are untouched — the restore simply appends a new version on top of the chain, so the full sequence (…, vN, vN+1 restored-copy) remains visible in both Version History and Lineage.

**How would you extend this module to support complete audit tracking?**
Add an immutable `AuditEvent` table capturing every API call (actor, IP, endpoint, before/after payload hash, timestamp), stream `DatasetChangeLog` inserts to an append-only log/event bus (e.g. Kafka) for tamper-evidence, and add row-level "changed_by" + "reason" capture on every mutation already logged.

## 13. Submission Checklist

- [x] Complete source code (backend + frontend)
- [x] Database schema / SQL scripts (`schema.sql`, `seed.sql`)
- [x] API documentation (`docs/API_DOCUMENTATION.md`)
- [x] README (this file) — setup, architecture, DB design, API details, versioning approach, key decisions
- [ ] Git branch with implementation — create `feature/task-27-dataset-versioning` and push this source tree
- [ ] Screenshots of implemented screens — capture after running `npm run dev` locally (see §4)
- [ ] Short demo/video walkthrough — record after local run

---
*Built for Task 27 — Dataset Versioning, Lineage & Change Tracking Module. Deadline: 30 Sep 2026.*
