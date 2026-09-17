# Dataset Preparation & Transformation Module

A full-stack module that lets users select a processed dataset, inspect its structure, build an ordered
pipeline of transformations, preview the effect of those transformations, validate the result, and save it
as a new **immutable prepared version** — without ever modifying the original dataset.

```
Select Dataset → Inspect Data → Apply Transformations → Preview Changes → Validate → Save Prepared Version
```

**Stack:** React 18 + Tailwind CSS (frontend) · Node.js + Express (backend) · MySQL 8 (database)

---

## 1. Project Overview

The app is split into two independent projects:

```
dataset-prep-module/
├── backend/     Express REST API, transformation engine, MySQL access layer
├── frontend/    React SPA (Vite), Tailwind CSS, Recharts
└── README.md
```

Row-level dataset data is stored as JSON snapshots on disk (`backend/storage/uploads` for the original
source files, `backend/storage/prepared` for saved prepared versions), while all **metadata** — datasets,
versions, transformation steps, execution history, validation results, users — lives in MySQL. This mirrors
how a real platform would separate a data lake / object store from a metadata catalog, while staying simple
enough to run entirely on a local machine.

## 2. Technologies Used

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Tailwind CSS, Recharts, lucide-react icons, Axios |
| Backend | Node.js, Express, JWT auth (jsonwebtoken), bcryptjs |
| Database | MySQL 8 (mysql2/promise driver) |
| Tooling | Vite (frontend dev server/build) |

## 3. Setup Instructions

### Prerequisites
- Node.js **v18+** (tested with v24.18.1)
- MySQL Server running locally, with a client such as MySQL Workbench

### 3.1 Database
1. Open MySQL Workbench (or the `mysql` CLI) connected to your local server.
2. Run the full contents of **`backend/sql/schema.sql`**. This will:
   - Create the `dataset_prep_module` database
   - Create all 6 tables (`users`, `datasets`, `dataset_versions`, `transformations`,
     `transformation_history`, `validation_results`)
   - Seed 3 demo users (one per role) and 3 demo datasets (with a first "Original" version)

The dataset seed rows point at JSON files already included at `backend/storage/uploads/*.json` — no file
upload step is required to try the app.

### 3.2 Backend
```bash
cd backend
npm install
cp .env.example .env
```
Edit `.env` and set your MySQL credentials:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=dataset_prep_module
JWT_SECRET=some_long_random_string
```
Then start the API:
```bash
npm start          # production
npm run dev         # nodemon, auto-restart on changes
```
The API runs at `http://localhost:5000`. Health check: `GET http://localhost:5000/api/health`.

### 3.3 Frontend
```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:5000/api
npm run dev
```
The app runs at `http://localhost:5173`.

### 3.4 Test Credentials
All seed users share the password **`Password123!`**

| Role | Email | Permissions |
|---|---|---|
| Administrator | `admin@dpm.com` | Full access — view everything, delete prepared versions |
| Data Steward | `steward@dpm.com` | Build transformations, run validation, save prepared versions |
| Data Analyst | `analyst@dpm.com` | View/preview datasets, build draft transformations, view versions & history |

Only **Admin** and **Data Steward** can run validation or save a prepared version; only **Admin** can delete
a prepared version. These rules are enforced in `backend/src/middleware/auth.js` (`authorize(...)`) on every
route — the frontend only hides buttons as a UX convenience, it never relies on hiding alone.

---

## 4. Database Schema

```
users ─┬─< datasets ─┬─< dataset_versions ─┬─< transformations
       │              │                     ├─< transformation_history
       │              │                     └─< validation_results
       └──────────────┴── (created_by / performed_by FKs on every table)
```

- **users** — id, name, email, password_hash, role (`ADMIN` / `DATA_STEWARD` / `DATA_ANALYST`)
- **datasets** — the processed source datasets available for preparation (row/column counts, quality score,
  status, pointer to the raw JSON file)
- **dataset_versions** — one row per saved version (`version_number` 1 = Original, 2+ = prepared versions),
  each pointing to its own JSON snapshot on disk
- **transformations** — one row per pipeline step; `version_id IS NULL` while still a **draft** in the
  builder, and gets stamped with a `version_id` the moment the version is saved (making it immutable)
- **transformation_history** — an audit-log row per step execution, written when a version is saved
- **validation_results** — snapshot of a validation run, optionally tied to a specific version

All FKs use `ON DELETE CASCADE` (child rows) or `ON DELETE SET NULL` (audit references to `users`), and the
frequently-filtered/sorted columns (`status`, `dataset_id`, `execution_order`, `executed_at`) are indexed.

---

## 5. API Documentation

Base URL: `http://localhost:5000/api`. Every route except `/auth/login` requires
`Authorization: Bearer <token>`.

### Auth
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Returns a JWT + user profile |
| POST | `/auth/register` | Admin | Create a new user |
| GET | `/auth/me` | Any | Current user profile |

### Datasets
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/datasets` | Any | List datasets — supports `search`, `status`, `page`, `limit`, `sort` |
| GET | `/datasets/:id` | Any | Dataset details + its versions |
| GET | `/datasets/:id/preview` | Any | Column stats + first 20 records (optional `?versionId=`) |

### Transformation Builder (draft steps)
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/datasets/:id/transform` | Steward/Analyst/Admin | Add a draft step |
| GET | `/datasets/:id/transformations` | Any | List current draft steps, in order |
| PUT | `/transformations/:stepId` | Steward/Analyst/Admin | Edit a draft step |
| DELETE | `/transformations/:stepId` | Steward/Analyst/Admin | Remove a draft step |
| PUT | `/datasets/:id/transformations/reorder` | Steward/Analyst/Admin | `{ orderedIds: [...] }` |
| POST | `/datasets/:id/transformations/preview` | Any | Runs the draft pipeline, returns before/after diff |

### Validation
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/datasets/:id/validate` | Steward/Admin | Runs checks against the draft pipeline result |
| GET | `/datasets/:id/validation-results` | Any | Validation run history |

### Versions
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/datasets/:id/versions` | Any | List all saved versions |
| POST | `/datasets/:id/versions` | Steward/Admin | Applies the draft pipeline and saves a new immutable version |
| GET | `/datasets/:id/versions/:versionId` | Any | Version detail incl. its transformations + validation |
| DELETE | `/datasets/:id/versions/:versionId` | Admin | Delete a prepared version (not the Original) |

### History & Dashboard
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/datasets/:id/history` | Any | Transformation history for one dataset — search/filter/paginate |
| GET | `/history` | Any | Global transformation history across all datasets |
| GET | `/dashboard/data-preparation` | Any | Summary cards + chart data |

All responses follow `{ success: boolean, data, pagination?, message? }`.

---

## 6. Supported Transformations

| Category | Operation | Configuration |
|---|---|---|
| Column | Rename Column | `column`, `newName` |
| Column | Remove Column | `column` |
| Column | Change Data Type | `column`, `newType` (String / Integer / Decimal / Boolean / Date) |
| Missing Values | Remove Null Rows | `column` (optional — omit to check every column) |
| Missing Values | Replace Null Values | `column`, `value` |
| Text | Trim Whitespace | `column` |
| Text | Convert to Uppercase / Lowercase | `column` |
| Numeric | Round Decimal Values | `column`, `precision` |
| Numeric | Add Numeric Value | `column`, `amount` |
| Numeric | Multiply Numeric Value | `column`, `factor` |
| Row | Remove Duplicate Rows | — |
| Row | Filter Rows | `column`, `operator` (equals / not_equals / greater_than / less_than / contains / is_null), `value` |

Implemented in `backend/src/services/transformationEngine.js` as small, pure, independently-testable
functions, one per operation, registered in a `TRANSFORM_HANDLERS` lookup table.

## 7. Transformation Execution Flow

1. The **builder** stores every step the user adds as a row in `transformations` with `version_id = NULL`
   (a "draft"), tagged with an `execution_order`.
2. **Preview** (`POST /transformations/preview`) loads the *Original* dataset JSON fresh, then runs
   `engine.runPipeline()`, which applies each draft step **in `execution_order`**, threading the output of
   one step into the input of the next. It returns a before/after diff and a per-step execution log —
   nothing is written to disk or the database yet.
3. **Validate** (`POST /validate`) runs the same pipeline, then runs rule-based checks (nulls, duplicates,
   missing required columns) against the result and stores a `validation_results` snapshot.
4. **Save Version** (`POST /versions`) re-runs the pipeline one last time inside a DB transaction, writes
   the resulting JSON to `storage/prepared/dataset_{id}_v{n}.json`, inserts the `dataset_versions` row,
   re-points every draft `transformations` row at the new `version_id` (making them immutable), writes one
   `transformation_history` row per step, and stores a final `validation_results` snapshot — all committed
   together so the version, its steps, its history, and its validation result can never go out of sync.

---

## 8. Write-Up Questions

**How did you design the transformation workflow?**
As a two-phase model: a mutable **draft** (rows in `transformations` with `version_id = NULL`, scoped to one
dataset at a time) that the user freely adds to, edits, reorders and deletes; and an immutable **saved
version**, created only when the draft is applied and persisted. Preview and Validate both run the exact
same `runPipeline()` function against the draft, so what the user sees in "Preview Changes" and "Validation"
is guaranteed to be exactly what gets saved — there's only one code path that executes transformations.

**How are multiple transformations executed in the correct order?**
Each step has an integer `execution_order` column. The builder always appends new steps at
`max(order) + 1`, and reordering (drag-equivalent up/down controls in the UI) re-writes the order column for
every affected row. `runPipeline()` simply queries steps `ORDER BY execution_order ASC` and reduces over
them sequentially, feeding each step's output `{columns, rows}` in as the next step's input.

**How did you ensure the original dataset is not modified when creating a prepared version?**
The Original dataset's row data lives in a read-only JSON file referenced by `datasets.file_name`
(`storage/uploads/...json`), and the pipeline always starts from a **deep clone** of that data
(`engine.cloneData`). Every transformation function returns a *new* `{columns, rows}` object rather than
mutating its input. A saved version writes its result to a brand-new file
(`storage/prepared/dataset_{id}_v{n}.json`) — the original file on disk is never opened for writing after
initial seeding, and `dataset_versions.version_number = 1` ("Original") always resolves back to that
same source file.

**How did you store transformation configurations in the database?**
As a `JSON` column (`transformations.configuration`) so each operation type can have an arbitrary,
self-describing shape (e.g. `{ column, newName }` for a rename vs. `{ column, operator, value }` for a
filter) without needing a different table per operation type.

**How would you handle a transformation that fails halfway through execution?**
`runPipeline()` wraps each step in a `try/catch`. On failure it records a `FAILED` step result with the
error message and **halts the pipeline**, returning the data as it stood after the last successful step
rather than silently skipping the broken step and continuing. That partial result is what's shown in
Preview/Validation, so the user sees exactly where it broke and why before ever saving a version — nothing
partially-transformed is ever persisted as a version, since `createVersion` re-validates the whole pipeline
inside one DB transaction and only commits if it completes.

**How would you optimize the system for datasets containing millions of records?**
- Move row storage from JSON files into a columnar/chunked format (Parquet) or a dedicated data-processing
  engine, and page through data rather than loading a whole dataset into memory.
- Push simple, common operations (trim, case conversion, null replace, dedupe, filter) down into SQL /
  a query engine instead of JS array iteration, or use a streaming transform (Node streams / worker
  threads) so the full dataset is never materialized in memory at once.
- Sample-based preview: the builder/preview UI already only needs the first 20 rows and column stats — that
  can be computed from a sample rather than a full scan for the interactive preview, with the full pipeline
  only run in full at Validate/Save time.
- Add pagination + server-side computed stats for the preview endpoint, and cache column statistics rather
  than recomputing them on every request.

**How would you redesign the architecture if transformations needed to run asynchronously in the background?**
- Introduce a job queue (e.g. BullMQ/Redis or a simple DB-backed job table) — `POST /versions` would enqueue
  a job and return `202 Accepted` with a job id immediately instead of blocking on the pipeline.
  A worker process consumes the queue, runs `runPipeline()`, writes the prepared file, and updates
  `dataset_versions.status` (`PROCESSING` → `VALID`/`FAILED`) and `transformation_history` as it progresses.
- The frontend would poll `GET /versions/:id` (or use WebSockets/SSE) to reflect live status instead of
  assuming the save call itself is synchronous, and the "Save Prepared Version" button would show a
  progress/queued state rather than a spinner tied to one HTTP request.
- This also naturally enables running very large pipelines without hitting HTTP timeouts, and lets multiple
  transformation jobs run concurrently across datasets while still processing steps within one dataset's
  pipeline strictly in order.

---

## 9. Screenshots & Demo Video

Placeholders — add these once the app is running locally:
- `docs/screenshots/` — Login, Dataset List, Dataset Details, Dataset Preview, Transformation Builder,
  Transformation Preview, Validation Results, Prepared Dataset Version, Transformation History, Dashboard
- `docs/demo.mp4` — full workflow: Login → Select Dataset → Preview → Add Transformations → Preview
  Changes → Validate → Save Version → View History

## 10. Notes

- This is an independent training assignment inspired by common enterprise data-platform workflows. No
  confidential project code, internal documentation, database structures, API specs, or proprietary
  implementation details were used — all requirements, schema, and code here were built from scratch based
  only on the assignment brief.
- The frontend groups "Dataset Details", "Dataset Preview", "Transformation Builder", "Transformation
  Preview", "Validation Results", "Prepared Versions", and "Transformation History" as tabs inside one
  Dataset Workspace (`/datasets/:id?tab=...`) rather than as separate top-level routes, matching how this
  kind of step-by-step preparation tool is typically built in practice while still giving every required
  page its own dedicated, linkable view.
