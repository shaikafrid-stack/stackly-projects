# DataQuality Pro — Dataset Profiling & Data Quality Analysis Module

A full-stack module that lets users select a processed dataset, run automated
profiling, inspect column-level statistics, review data quality issues, and
track an overall data quality score through a professional dashboard.

Workflow: **Dataset Selection → Profiling → Column Analysis → Quality Checks → Score Calculation → Dashboard**

---

## 1. Project Overview

- Users upload/select a dataset (CSV) that has already been marked `PROCESSED`.
- Running **Profile Dataset** parses the file, computes dataset-level and
  column-level statistics, detects each column's data type, runs four quality
  checks (Completeness, Uniqueness, Validity, Consistency) plus duplicate-row
  detection, and produces an overall + per-dimension quality score.
- Results are persisted (dataset profile, column profiles, quality issues) so
  they can be revisited without re-running profiling.
- Three roles (Administrator, Data Analyst, Data Steward) have different
  permissions, enforced on the backend via middleware — not just hidden in the UI.

## 2. Technologies Used

**Frontend:** React 18 (Vite), React Router, Tailwind CSS, Recharts, Axios
**Backend:** Node.js, Express.js, Sequelize ORM, JWT auth, bcrypt, multer, csv-parse
**Database:** MySQL 8

---

## 3. Project Structure

```
dqp-project/
├── backend/
│   ├── src/
│   │   ├── config/        # db connection, constants
│   │   ├── models/        # Sequelize models + associations
│   │   ├── middleware/     # auth, role-based authorization, error handling
│   │   ├── services/      # dataTypeDetector, profilingService, qualityService, scoringService
│   │   ├── controllers/   # request handlers
│   │   ├── routes/        # REST route definitions
│   │   ├── app.js
│   │   └── server.js
│   ├── seed/               # demo users + sample CSV datasets, seed script
│   ├── schema.sql          # raw MySQL schema (also auto-created by Sequelize)
│   └── uploads/            # uploaded dataset files (gitignored, kept via .gitkeep)
├── frontend/
│   └── src/
│       ├── api/            # axios instance + endpoint wrappers
│       ├── context/         # AuthContext (JWT session)
│       ├── components/      # layout + reusable UI (Card, Table, Badge, Modal, Loader...)
│       └── pages/           # Login, Dashboard, DatasetList, DatasetDetails,
│                             # ColumnAnalysis, QualityIssues, QualityRules
└── README.md
```

---

## 4. Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL 8 (running locally or remotely)

### Database Configuration
1. Create the database (Sequelize's `sync()` will also auto-create tables on
   first server start, but you can run the schema manually too):
   ```bash
   mysql -u root -p < backend/schema.sql
   ```
   or simply let the backend create it — just ensure a database named
   `dqp_db` exists / is creatable by your MySQL user.

2. Copy the example env file and fill in your MySQL credentials:
   ```bash
   cd backend
   cp .env.example .env
   ```
   ```ini
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=dqp_db
   DB_USER=root
   DB_PASSWORD=your_password
   JWT_SECRET=replace_this_with_a_long_random_secret
   JWT_EXPIRES_IN=8h
   ```

### Backend
```bash
cd backend
npm install
npm run seed      # creates demo users + 2 sample datasets (customers.csv, orders.csv)
npm run dev        # starts on http://localhost:5000 (nodemon) — or `npm start`
```
On startup the server calls `sequelize.sync()`, which creates any missing
tables automatically, so `schema.sql` is optional/for reference.

### Frontend
```bash
cd frontend
npm install
npm run dev         # starts on http://localhost:5173, proxies /api to :5000
```

Open `http://localhost:5173` and log in.

### Test Credentials (created by `npm run seed`)

| Role            | Email               | Password      |
|-----------------|----------------------|---------------|
| Administrator   | admin@dqp.com         | Admin@123     |
| Data Analyst    | analyst@dqp.com       | Analyst@123   |
| Data Steward    | steward@dqp.com       | Steward@123   |

The login screen also has one-click buttons to autofill these.

---

## 5. Database Schema

See `backend/schema.sql` for full DDL. Summary of tables:

- **users** — id, name, email, password (bcrypt hash), role
- **datasets** — id, name, file_name, file_path, file_type, row_count,
  column_count, status, profile_status, quality_score, last_profiled_at,
  uploaded_by (FK → users)
- **dataset_profiles** — one row per profiling run: dataset-level metrics +
  the 4 dimension scores + overall quality_score (FK → datasets, cascade delete)
- **column_profiles** — one row per column per profiling run (FK → dataset_profiles
  and → datasets, cascade delete)
- **quality_issues** — individual issues found during profiling: column,
  issue type, affected records, percentage, severity, description
  (FK → datasets, cascade delete)
- **quality_rules** — configurable thresholds per rule type
  (COMPLETENESS / UNIQUENESS / VALIDITY / CONSISTENCY), used to evaluate
  PASSED / WARNING / FAILED verdicts

Indexes exist on dataset status/name, profile↔dataset FKs, column quality
score, and issue severity to keep listing/filtering/sorting fast.

---

## 6. API Documentation

All endpoints (except `/auth/login` and `/auth/register`) require
`Authorization: Bearer <JWT>`.

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/login` | public |
| POST | `/api/auth/register` | public |
| GET  | `/api/auth/me` | authenticated |

### Datasets
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/datasets?search=&status=&page=&limit=&sortBy=&order=` | any authenticated role |
| GET | `/api/datasets/:id` | any authenticated role |
| POST | `/api/datasets` (multipart `file`, optional `name`) | Admin, Analyst, Steward |
| DELETE | `/api/datasets/:id` | Admin only |

### Profiling
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/datasets/:id/profile` | Admin, Analyst, Steward |
| GET  | `/api/datasets/:id/profile` | any authenticated role |
| GET  | `/api/datasets/:id/profile/columns?sortBy=&order=&dataType=&qualityStatus=&search=` | any authenticated role |
| GET  | `/api/datasets/:id/profile/columns/:columnId` | any authenticated role |

### Quality
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/datasets/:id/quality` | any authenticated role |
| GET | `/api/datasets/:id/quality/issues?issueType=&severity=&column=&page=&limit=` | any authenticated role |

### Quality Rules
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/quality-rules` | any authenticated role |
| POST | `/api/quality-rules` | Admin, Steward |
| PUT | `/api/quality-rules/:id` | Admin, Steward |
| DELETE | `/api/quality-rules/:id` | Admin, Steward |

### Dashboard
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/dashboard/data-quality` | any authenticated role |

All responses follow `{ success, data, message?, pagination? }`. Errors return
appropriate HTTP status codes (400/401/403/404/422/500) with a `message`.

---

## 7. Data Quality Scoring Formula

Documented in full (with rationale) in `backend/src/services/scoringService.js`.

**Dimension scores (per dataset, 0–100%):**
- `COMPLETENESS = (non_null_cells / total_cells) * 100`
- `VALIDITY = (valid_values / total_non_null_values) * 100`
- `UNIQUENESS = average across columns of (unique_values / non_null_values) * 100`
- `CONSISTENCY = average across columns of (values matching the dominant format pattern / non_null_values) * 100`

**Overall Dataset Quality Score (weighted average):**
```
OVERALL = COMPLETENESS * 0.35
        + VALIDITY     * 0.30
        + UNIQUENESS   * 0.20
        + CONSISTENCY  * 0.15
```
Completeness and validity are weighted highest since missing or wrong-type
data is typically the most damaging to downstream analytics.

**Column Quality Score:**
```
COLUMN_SCORE = col_completeness * 0.4
             + col_validity     * 0.3
             + col_uniqueness   * 0.2
             + col_consistency  * 0.1
```
**Column status:** `GOOD` ≥ 85, `WARNING` 60–84, `POOR` < 60.

**Quality check verdicts** (Completeness / Uniqueness / Validity /
Consistency / Duplicate Records) compare the corresponding score against a
configurable threshold (from `quality_rules`, defaulting to 90/85/90/80):
`PASSED` if score ≥ threshold, `WARNING` if within 15 points below it,
otherwise `FAILED`.

---

## 8. Write-Up Answers

**How did you calculate the dataset-level data quality score?**
It's a weighted average of four dimension scores (Completeness 35%, Validity
30%, Uniqueness 20%, Consistency 15%) computed across the whole dataset — see
the formula section above and inline documentation in `scoringService.js`.

**How did you calculate the column-level quality score?**
Same four dimensions computed per-column, combined with weights 40/30/20/10
(completeness weighted highest at the column level since a single very
incomplete column should visibly drag its own score down), producing a 0–100
score mapped to GOOD/WARNING/POOR.

**How did you detect null, duplicate, and invalid values?**
- *Null*: a cell is null if its trimmed string value is empty after CSV parsing.
- *Duplicate values (column)*: values are grouped by exact string match;
  any group with count > 1 contributes `count - 1` duplicates.
- *Duplicate rows (dataset)*: each row is serialized (ordered column values)
  into a signature string; rows sharing a signature beyond the first count as duplicates.
- *Invalid*: a column's data type is detected via majority vote across its
  non-null values (≥ 80% agreement on INTEGER/DECIMAL/BOOLEAN/DATE, else
  STRING). Any individual value that doesn't match the detected type is
  counted invalid (e.g., `"abc"` in an INTEGER column).

**How did you design the relationship between dataset profiles, column
profiles, and quality issues?**
`datasets` 1—N `dataset_profiles` (one row per profiling run, so history is
preserved). `dataset_profiles` 1—N `column_profiles` (per-column results tied
to that specific run). `datasets` 1—N `quality_issues` (issues are
re-generated and replace prior issues each time profiling runs, always tied
back to the dataset). All child tables cascade-delete when their parent
dataset is removed.

**How would you optimize profiling if the dataset contained millions of
records?**
Stream-parse the file (row-by-row) instead of loading it fully into memory;
compute column statistics with single-pass streaming aggregators (running
counts, HyperLogLog or a bounded sample for approximate uniqueness instead of
exact `Set`s, reservoir sampling for min/max/avg); chunk duplicate-row
detection using a hashed signature stored in a disk-backed structure (e.g.
RocksDB or a scratch MySQL table) rather than an in-memory Map; parallelize
per-column computation across worker threads; push heavy aggregation into the
database (e.g. `COUNT`, `COUNT(DISTINCT)`, `GROUP BY` on an imported staging
table) rather than doing it all in application code.

**How would you implement asynchronous/background profiling in a production
environment?**
`POST /profile` would enqueue a job (BullMQ/Redis, RabbitMQ, or a DB-backed
job table) and return `202 Accepted` immediately with `profileStatus =
IN_PROGRESS`. A worker process consumes the queue, runs the profiling logic,
writes results, and updates `profileStatus` to `COMPLETED`/`FAILED`. The
frontend polls `GET /profile` (or subscribes via WebSocket/SSE) to reflect
progress without blocking the UI, matching the loading states already
implemented (Started / In Progress / Completed / Failed).

**How would you allow administrators to create new quality rules without
modifying application code?**
This is already implemented via the `quality_rules` table and the
`/api/quality-rules` CRUD endpoints — an Admin/Steward can add a rule with a
`ruleType`, `threshold`, and `severity`, and `qualityService.evaluateChecks()`
picks up any `ACTIVE` rule for that dimension at evaluation time, overriding
the built-in default threshold. To go further in production, rule types
themselves (not just thresholds) could be made pluggable — e.g. storing a
small rule-expression/DSL or a reference to a registered check function name
in the `quality_rules` table, and having the evaluation engine dynamically
dispatch based on that field, so brand-new check types don't require a
backend deploy either.

---

## 9. Notes

- This implementation profiles CSV files. The upload endpoint parses the file
  synchronously on upload to validate it and derive row/column counts; only
  datasets with `status = PROCESSED` can be profiled, matching the required workflow.
- Role-based access is enforced server-side in `roleMiddleware.js`, applied
  per-route (e.g. only Admin/Steward can manage quality rules; only Admin can
  delete datasets).
- Errors (dataset not found, not processed, empty dataset, profiling failure,
  unauthorized access, missing results) return meaningful HTTP status codes
  and messages, surfaced in the frontend via inline error states and empty states.
