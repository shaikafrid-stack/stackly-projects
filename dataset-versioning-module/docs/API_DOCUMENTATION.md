# API Documentation — Dataset Versioning, Lineage & Change Tracking Module

Base URL: `http://localhost:5000/api`
All endpoints except `/auth/login` and `/auth/demo-accounts` require:
```
Authorization: Bearer <jwt_token>
```

---

## Auth

### `POST /auth/login`
**Body**
```json
{ "username": "admin", "password": "admin123" }
```
**200 Response**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "user": { "id": 1, "username": "admin", "role": "Admin", "displayName": "Ava Admin" }
  }
}
```
**401** — invalid credentials.

---

## Datasets

### `GET /datasets`
Returns all datasets with a summary of their active version.
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Customer Transactions",
      "status": "Active",
      "active_version_id": 3,
      "active_version_number": 3,
      "active_record_count": 9875,
      "total_versions": 3
    }
  ]
}
```

### `GET /datasets/:id`
Dataset metadata + full active version object. `404` if not found.

### `POST /datasets` — *Admin, Data Steward*
**Body**
```json
{
  "name": "Marketing Leads",
  "description": "Inbound lead capture data",
  "recordCount": 1200,
  "columns": [{ "name": "lead_id", "type": "VARCHAR", "nullable": false }],
  "createdBy": "steward"
}
```
Creates the dataset **and** its implicit `Version 1`.
**409** if a dataset with that name already exists. **422** if `name` missing.

---

## Versions

### `GET /datasets/:datasetId/versions`
Version history, newest first.

### `POST /datasets/:datasetId/versions` — *Admin, Data Steward*
**Body**
```json
{
  "versionLabel": "v4 - Added region validation",
  "changeSummary": "Added region column and validation rule",
  "recordCount": 9900,
  "columns": [ /* full updated column list */ ],
  "transformations": ["Derive region from customer_id lookup"],
  "validationRules": ["region must be one of known regions"],
  "createdBy": "steward"
}
```
Archives the current active version, inserts the new one as `Active`, and **auto-generates** `DatasetChangeLog` rows by diffing against the previous version.
**422** if `changeSummary` missing. **404** if dataset not found. **409** if dataset has no prior version to branch from.

### `GET /versions/:id`
Version details, parsed schema snapshot, and its own change-log entries.

### `GET /versions/compare?versionA=<id>&versionB=<id>`
Structured diff between two versions of the **same** dataset.
```json
{
  "success": true,
  "data": {
    "versionA": { "id": 2, "versionNumber": 2, "recordCount": 9875, "status": "Archived" },
    "versionB": { "id": 3, "versionNumber": 3, "recordCount": 9875, "status": "Active" },
    "schemaDifferences": {
      "columnsAdded": [{ "name": "region", "type": "VARCHAR" }],
      "columnsRemoved": [],
      "columnTypeChanges": [],
      "hasChanges": true
    },
    "recordCountDifference": { "before": 9875, "after": 9875, "delta": 0, "percentChange": 0 },
    "transformationDifferences": { "added": ["Derive region from customer_id lookup"], "removed": [] },
    "validationDifferences": { "added": ["region must be one of known regions"], "removed": [] },
    "statusChange": { "changed": true, "before": "Archived", "after": "Active" }
  }
}
```
**422** if `versionA === versionB`, or params missing. **422** if versions belong to different datasets.

### `POST /versions/:id/restore` — *Admin*
**Body**
```json
{ "restoredBy": "admin" }
```
Creates a new version copying the target's contents; newer versions are preserved.
**409** if attempting to restore the version that is already latest.

### `PATCH /versions/:id/status` — *Admin, Data Steward*
**Body**
```json
{ "status": "Archived", "updatedBy": "steward" }
```
**422** if `status` is not one of `Draft | Active | Archived | Restored`.

---

## Change History & Lineage

### `GET /datasets/:datasetId/change-history`
Full, dataset-wide change log (all versions), newest first.

### `GET /datasets/:datasetId/lineage`
```json
{
  "success": true,
  "data": {
    "nodes": [ { "id": 1, "version_number": 1, "parent_version_id": null, "status": "Archived" }, "..." ],
    "edges": [
      {
        "source": 1,
        "target": 2,
        "sourceLabel": "v1 - Original Import",
        "targetLabel": "v2 - Cleaned Version",
        "transformation": "Removed duplicate rows, fixed amount data type",
        "user": "steward",
        "timestamp": "2026-08-05T14:20:00.000Z"
      }
    ]
  }
}
```

---

## Dashboard

### `GET /dashboard/summary`
```json
{
  "success": true,
  "data": {
    "totalDatasets": 2,
    "totalVersions": 4,
    "activeVersions": 2,
    "archivedVersions": 2,
    "recentlyModified": [ { "id": 1, "name": "Customer Transactions", "last_modified": "..." } ],
    "recentChanges": [ { "id": 6, "change_type": "VALIDATION_CHANGED", "description": "...", "dataset_name": "..." } ]
  }
}
```

---

## Standard Error Shape

```json
{ "success": false, "message": "Human-readable error message" }
```

| Status | Meaning |
|---|---|
| 401 | Missing/invalid/expired token |
| 403 | Authenticated but role not permitted |
| 404 | Dataset / version not found |
| 409 | Conflict (duplicate name, restoring latest version, etc.) |
| 422 | Validation error (missing/invalid fields) |
| 500 | Unexpected server error |
