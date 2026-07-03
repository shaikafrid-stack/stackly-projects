# Vendor Contract & Invoice Management System (VCIMS)

A full-stack, role-based web application for managing vendor contracts, invoices, approvals, and payments.

- **Frontend:** React.js + Tailwind CSS (Vite), Recharts for analytics
- **Backend:** Node.js + Express.js REST API, JWT authentication
- **Database:** MySQL

---

## 1. Folder Structure Overview

```
vcims/
├── backend/
│   ├── config/          # MySQL connection pool (config/db.js)
│   ├── controllers/     # Business logic per resource
│   ├── middlewares/     # auth (JWT + RBAC), upload (multer), error handler
│   ├── models/          # schema.sql - full MySQL DDL
│   ├── routes/          # Express route definitions
│   ├── services/        # (reserved for future service-layer code)
│   ├── utils/           # seed.js - demo data seeder
│   ├── uploads/         # mock invoice file storage
│   ├── server.js        # app entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/         # Login, Register
│   │   │   ├── admin/        # AdminDashboard, VendorManagement, ContractManagement
│   │   │   ├── finance/      # FinanceOverview, InvoiceApprovals, PaymentManagement
│   │   │   └── vendor/       # VendorDashboard, MyContracts, UploadInvoice, InvoiceHistory
│   │   ├── components/       # Sidebar, Topbar, DashboardLayout, StatusBadge, Pagination, etc.
│   │   ├── context/          # AuthContext (JWT session state)
│   │   ├── hooks/            # useDebounce
│   │   ├── services/         # api.js (Axios instance + interceptors)
│   │   ├── charts/           # Recharts components for the analytics dashboard
│   │   ├── utils/            # formatCurrency, formatDate
│   │   ├── App.jsx           # Route definitions + role-based protected routes
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── .env.example
│
└── README.md
```

---

## 2. Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL 8+

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your MySQL credentials
```

Create the database and tables (see [Database Setup](#3-database-setup) below), then:

```bash
npm run seed     # loads demo users, vendors, contracts, invoices, payments
npm run dev       # starts on http://localhost:5000 (nodemon)
# or: npm start
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_BASE_URL defaults to http://localhost:5000/api
npm run dev       # starts on http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` requests to `http://localhost:5000`, so the frontend also works if you leave `VITE_API_BASE_URL` unset.

---

## 3. Database Setup

```bash
mysql -u root -p < backend/models/schema.sql
```

This creates the `vcims_db` database and all six tables: `users`, `vendors`, `contracts`, `invoices`, `invoice_comments`, `payments`, plus supporting indexes.

Then run the seed script from `backend/` to populate demo data:

```bash
npm run seed
```

---

## 4. Test Credentials

All seeded accounts share the password: **`Password123!`**

| Role            | Email                | 
|-----------------|-----------------------|
| Admin           | admin@vcims.com       |
| Finance Manager | finance@vcims.com     |
| Vendor          | vendor@vcims.com      |

You can also register new accounts directly from the app's Register page (choose a role — Vendor registration auto-creates a linked vendor profile).

---

## 5. API Overview

| Category    | Endpoints |
|-------------|-----------|
| Auth        | `POST /api/register`, `POST /api/login`, `GET /api/profile` |
| Vendors     | `GET/POST /api/vendors`, `PUT/DELETE /api/vendors/:id` |
| Contracts   | `GET/POST /api/contracts`, `PUT/DELETE /api/contracts/:id` |
| Invoices    | `GET /api/invoices`, `GET /api/invoices/:id`, `POST /api/invoices` (multipart, mock file upload), `PUT/DELETE /api/invoices/:id` |
| Approvals   | `PUT /api/invoices/:id/approve`, `PUT /api/invoices/:id/reject` |
| Payments    | `POST /api/payments`, `GET /api/payments` |
| Dashboards  | `GET /api/dashboard/admin`, `GET /api/dashboard/finance`, `GET /api/dashboard/vendor` |

All endpoints (except register/login) require `Authorization: Bearer <token>`.

---

## 6. Write-Up Questions

**Q1. Explain the relationship between vendors, contracts, invoices, and payments in your database.**

A `vendor` can have many `contracts` (1:N). Each `contract` can have many `invoices` raised against it (1:N), and every `invoice` references both its parent `vendor_id` and `contract_id` for fast filtering without extra joins. Each `invoice` can receive multiple partial `payments` (1:N) recorded against `invoice_id`, and the invoice's `payment_status` is derived from the sum of its payments versus `invoice_amount`. `invoice_comments` gives a 1:N audit trail of approval/rejection notes tied to both the invoice and the user who wrote them. `users` is linked 1:1 (optionally) to `vendors.user_id` so a vendor's own login can be scoped to only their own contracts/invoices, while `admin` and `finance_manager` users have no vendor linkage and can see everything.

**Q2. How did you implement approval workflows for invoices?**

Every invoice starts with `approval_status = 'Pending'` on creation. Two dedicated endpoints — `PUT /api/invoices/:id/approve` and `PUT /api/invoices/:id/reject` — are the only way to transition that status, and both are guarded so they only operate on invoices currently in `Pending` state (idempotency guard against double-approval). An optional comment is stored in `invoice_comments`, giving a running log of who reviewed the invoice and why. The frontend's Finance module exposes an "Invoice Approval Dashboard" that filters by status and opens a confirmation modal before committing the decision, and vendors can only edit/delete invoices while they remain `Pending`, preventing edits after a decision has been made.

**Q3. How does the system prevent unauthorized users from approving invoices?**

Two layers of enforcement: (1) every protected route runs through an `authenticate` middleware that verifies the JWT and attaches the decoded `role` to `req.user`; (2) the approve/reject routes are wrapped in an `authorize('finance_manager', 'admin')` middleware that rejects any other role with a 403 before the controller even runs. On top of that, vendor-scoped controllers (invoices, contracts, payments) independently re-check that a vendor's `vendor_id` matches the record they're trying to touch, so even a compromised vendor token can't reach another vendor's data. The frontend also hides the approve/reject UI for non-finance roles and uses `ProtectedRoute` to block navigation to finance/admin routes, but the real enforcement is server-side.

**Q4. What validations are performed before marking an invoice as paid?**

`POST /api/payments` checks, in order: the invoice exists; the invoice's `approval_status` is `Approved` (unapproved invoices can never be paid); the new payment amount plus everything already paid against that invoice does not exceed `invoice_amount` (rejecting over-payment with the remaining balance in the error message); and only then does it insert the payment row and recompute `payment_status` as `Paid` (fully covered) or `Partially Paid` (partial), wrapped in a DB transaction so the payment insert and status update either both succeed or both roll back.

**Q5. If this system scaled to handle thousands of invoices daily, which module would you optimize first and why?**

The **Invoice + Payment module** and its supporting queries, because it's the highest-write, highest-read path in the system — every invoice submission, approval, and payment touches it, and the analytics dashboard aggregates across it constantly. Concretely: add composite indexes on `(vendor_id, approval_status)` and `(payment_status, due_date)` for the list/filter queries that currently scan by status; move heavy aggregate queries (monthly volume, vendor distribution, payment trends) into a scheduled materialized summary table refreshed periodically instead of computing them live on every dashboard load; introduce cursor-based pagination instead of `OFFSET` once tables grow past ~100k rows, since `OFFSET` gets slower the deeper you page; and consider splitting read traffic to a MySQL read replica for the dashboard/reporting endpoints so heavy analytics queries don't compete with the transactional approval/payment writes.

---

## 7. Notes

- File upload is implemented as a real `multipart/form-data` upload (via `multer`) that stores files under `backend/uploads/`, matching the task's "File Upload UI (Mock Only)" requirement — the UI treats it as a mock attachment without a document viewer.
- All list endpoints (vendors, contracts, invoices, payments) support `search`, status filters, and `page`/`limit` pagination.
- Passwords are hashed with `bcryptjs`; sessions use JWT stored in `localStorage` with automatic logout on 401 responses.
