# Dataset Upload, Validation & Processing Module

A full-stack data ingestion tool: users upload CSV/Excel datasets and move them through a controlled
**Upload → Validate → Preview → Process → Store → Track Status** workflow.

## 1. Project Overview

- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MySQL (via Sequelize ORM)
- **Auth**: JWT-based, with `ADMIN` and `ANALYST` roles

Two roles are implemented:

| Role | Capabilities |
|---|---|
| **Administrator** | View all datasets, view processing/validation status, delete datasets, monitor ingestion activity |
| **Data Analyst** | Upload datasets, view own datasets, preview contents, validate, process, view results |

## 2. Technologies Used

- React 18, React Router, Tailwind CSS, Recharts, Axios
- Express 4, Sequelize 6, MySQL2, Multer (file upload), csv-parse, xlsx (SheetJS)
- JWT (jsonwebtoken) + bcryptjs for authentication

## 3. Project Structure

```
dataset-module/
├── backend/
│   ├── src/
│   │   ├── config/        # DB connection
│   │   ├── controllers/   # Thin HTTP layer (req/res only)
│   │   ├── services/      # Business logic (file parsing, validation, processing)
│   │   ├── models/        # Sequelize models + associations
│   │   ├── middleware/    # auth, upload (multer), error handling
│   │   ├── routes/        # Express routers
│   │   ├── utils/         # file parser, DB seed script
│   │   └── uploads/       # uploaded files land here (gitignored)
│   ├── sql/schema.sql     # raw SQL schema (reference / manual setup)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/           # axios client + endpoint wrappers
│   │   ├── components/    # reusable UI (Table, Modal, StatusBadge, etc.)
│   │   ├── context/       # Auth + Toast providers
│   │   └── pages/         # Login, Dashboard, DatasetList, Upload, Details, Profile
│   └── package.json
└── README.md
```

## 4. Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL 8+ running locally (or a reachable instance)

### Database Configuration

1. Create the database (Sequelize will also auto-create tables on first run via `sync()`,
   but you can run the SQL manually if preferred):
   ```bash
   mysql -u root -p < backend/sql/schema.sql
   ```
2. Copy the backend env file and fill in your MySQL credentials:
   ```bash
   cd backend
   cp .env.example .env
   # edit .env: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET
   ```

### Backend

```bash
cd backend
npm install
npm run seed     # creates test Admin + Analyst users
npm run dev       # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:5000/api
npm run dev             # starts on http://localhost:3000
```

The Vite dev server also proxies `/api` to `http://localhost:5000`, so the frontend works
out of the box against a locally running backend.

### Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | Admin@123 |
| Analyst | analyst@example.com | Analyst@123 |

(created by `npm run seed` in `backend/`)

### Sample Dataset

Any CSV or `.xlsx` file with a header row works. A minimal example:

```csv
customer_id,customer_name,purchase_date,amount
1,John Doe,2026-01-15,120.50
2,Jane Smith,2026-01-16,89.99
3,Bob Lee,2026-01-17,ABC
```
(Row 3's `amount` is intentionally invalid, to demonstrate validation error reporting.)

## 5. API Documentation

All endpoints are prefixed with `/api` and (except `/auth/*`) require `Authorization: Bearer <token>`.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create a user |
| POST | `/auth/login` | Returns `{ token, user }` |
| GET | `/auth/me` | Current user profile |

### Datasets
| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/datasets/upload` | ANALYST | Multipart upload: `name, description, category, tags, file` |
| GET | `/datasets` | ADMIN/ANALYST | List (query: `search, status, page, limit`) — Admin sees all, Analyst sees own |
| GET | `/datasets/:id` | ADMIN/ANALYST | Dataset detail |
| DELETE | `/datasets/:id` | ADMIN | Delete dataset + file |
| GET | `/datasets/:id/preview` | ADMIN/ANALYST | Columns, row/col counts, first N rows |
| GET | `/datasets/:id/schema` | ADMIN/ANALYST | Detected column types |
| POST | `/datasets/:id/validate` | ANALYST | Runs validation, persists results |
| GET | `/datasets/:id/validation-results` | ADMIN/ANALYST | Summary + row-level errors |
| POST | `/datasets/:id/process` | ANALYST | Ingests a VALIDATED dataset |
| GET | `/datasets/:id/processing-status` | ADMIN/ANALYST | Current status snapshot |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard/datasets` | Totals, datasets by status/file type, recent uploads |

## 6. Database Design

See `backend/sql/schema.sql`. Tables: `users`, `datasets`, `dataset_columns`,
`validation_results`, `validation_errors`, with foreign keys, cascading deletes, and
indexes on frequently-filtered columns (`status`, `uploaded_by`, `dataset_id`).

## 7. Screenshots & Demo Video

_Add screenshots of the flows below before submission:_
Login · Dataset Dashboard · Upload Dataset · Dataset List · Dataset Preview ·
Schema Detection · Validation Results · Processing Status · Final Processed Dataset ·
Analytics Dashboard.

_Add a short screen-recorded demo of: Login → Upload → Validate → Preview → Process → View Results._

---

## 8. Write-Up Questions

**How did you handle CSV and Excel file processing?**
A single `parseDatasetFile()` utility (`backend/src/utils/fileParser.js`) normalizes both formats
into the same `{ headers, rows }` shape. CSV is parsed with `csv-parse` (columns:true), and `.xlsx`
is parsed with SheetJS (`XLSX.utils.sheet_to_json`), reading only the first sheet. Downstream
services (schema detection, validation, processing) are format-agnostic — they just consume the
normalized structure, so adding a new format only means extending this one utility.

**How does the backend detect column data types?**
`schemaService.detectSchema()` samples every non-empty value in a column and tests it against
BOOLEAN, INTEGER, DECIMAL, and DATE patterns (checked in that precedence order). A type is only
assigned if ≥90% of the column's non-empty values match it; otherwise the column falls back to
STRING. This threshold-based approach tolerates a handful of dirty values without misclassifying
an otherwise well-typed column, and nullability is inferred from whether any values were empty.

**How did you design the validation workflow?**
Validation is a two-stage pipeline in `validationService.js`: (1) **header validation** — checks
for missing/empty/duplicate headers — and (2) **row validation** — for every row, checks each
value against its detected column type (invalid numeric, invalid date) and separately tallies
missing values and duplicate rows (via a row-content hash). The pipeline returns a summary object
(matching the `validation_results` table) plus a flat list of row/column-level errors (matching
`validation_errors`), which are persisted together and drive the dataset's status transition to
either `VALIDATED` or `VALIDATION_FAILED`.

**How did you ensure that large datasets do not block the main application workflow?**
In this implementation, parsing/validation runs synchronously within the request but is isolated
in the service layer so it never touches the HTTP layer directly, and dataset status is updated to
`VALIDATING`/`PROCESSING` immediately so the UI can poll and reflect progress rather than hanging
on one request. For genuinely large files, the honest answer is that synchronous processing is a
scaling limit — see the next answer for how this would be addressed in production.

**How would you modify the architecture if the system needed to process millions of records?**
I'd move from synchronous, request-bound processing to a streaming, queue-based pipeline: parse
files with streaming readers (Node streams / a SAX-style XLSX reader) instead of loading the whole
file into memory, batch-insert rows instead of row-by-row writes, and paginate/limit any UI preview
queries. Validation and processing would be handed off to background workers (see next answer)
rather than done inline in the HTTP request/response cycle.

**How would you implement asynchronous/background processing in a production environment?**
Upload would just persist the file and enqueue a job (e.g., BullMQ/Redis, or SQS/RabbitMQ) rather
than validating/processing inline. A worker pool would consume jobs, stream-parse the file in
chunks, write progress back to the `datasets` row (or a separate `job_status` table) as it goes, and
the frontend would poll `/processing-status` (or subscribe via WebSocket/SSE) instead of blocking on
a single long-lived request. This also makes retries and horizontal scaling of workers straightforward.

**What changes would you make to support additional file formats such as JSON or Parquet?**
Extend `fileParser.js` with format-specific branches that all resolve to the same `{ headers, rows }`
contract — JSON via `JSON.parse`/streaming JSON parsers for large files, Parquet via a library like
`parquetjs`. Because schema detection, validation, and processing only depend on that shared shape,
no other layer needs to change; `file_type` would just gain new enum values (`JSON`, `PARQUET`) in
the `datasets` table and the upload middleware's allowed-extensions list.
