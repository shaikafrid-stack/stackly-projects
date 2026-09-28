const { pool } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const { compareVersions, buildChangeLogEntries, safeParse } = require('../utils/diffEngine');

const VALID_STATUSES = ['Draft', 'Active', 'Archived', 'Restored'];

async function fetchVersionOrThrow(conn, versionId) {
  const [[version]] = await conn.query('SELECT * FROM DatasetVersion WHERE id = ?', [versionId]);
  if (!version) throw new AppError(`Version ${versionId} not found`, 404);
  return version;
}

// GET /api/datasets/:datasetId/versions
async function getVersions(req, res, next) {
  try {
    const { datasetId } = req.params;
    const [dataset] = await pool.query('SELECT id FROM Dataset WHERE id = ?', [datasetId]);
    if (!dataset.length) throw new AppError(`Dataset ${datasetId} not found`, 404);

    const [versions] = await pool.query(
      `SELECT id, dataset_id, version_number, version_label, parent_version_id, record_count,
              status, change_summary, created_by, created_at
       FROM DatasetVersion WHERE dataset_id = ? ORDER BY version_number DESC`,
      [datasetId]
    );
    res.json({ success: true, data: versions });
  } catch (err) {
    next(err);
  }
}

// GET /api/versions/:id
async function getVersionDetails(req, res, next) {
  try {
    const { id } = req.params;
    const version = await fetchVersionOrThrow(pool, id);
    const [changeLog] = await pool.query(
      'SELECT * FROM DatasetChangeLog WHERE version_id = ? ORDER BY changed_at DESC',
      [id]
    );
    res.json({
      success: true,
      data: { ...version, schema: safeParse(version.schema_json, {}), changeLog },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/datasets/:datasetId/versions
async function createVersion(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const { datasetId } = req.params;
    const { versionLabel, changeSummary, createdBy, recordCount, columns, transformations, validationRules } =
      req.body;

    if (!changeSummary) throw new AppError('changeSummary is required', 422);

    await conn.beginTransaction();

    const [[dataset]] = await conn.query('SELECT * FROM Dataset WHERE id = ? FOR UPDATE', [datasetId]);
    if (!dataset) throw new AppError(`Dataset ${datasetId} not found`, 404);

    const [[latest]] = await conn.query(
      'SELECT * FROM DatasetVersion WHERE dataset_id = ? ORDER BY version_number DESC LIMIT 1',
      [datasetId]
    );
    if (!latest) throw new AppError(`Dataset ${datasetId} has no existing version to branch from`, 409);

    const nextVersionNumber = latest.version_number + 1;
    const schemaJson = JSON.stringify({
      columns: columns ?? safeParse(latest.schema_json, {}).columns ?? [],
      transformations: transformations ?? [],
      validationRules: validationRules ?? safeParse(latest.schema_json, {}).validationRules ?? [],
    });

    // Deactivate current active version (a dataset has exactly one Active version)
    await conn.query(
      "UPDATE DatasetVersion SET status = 'Archived' WHERE dataset_id = ? AND status = 'Active'",
      [datasetId]
    );

    const [result] = await conn.query(
      `INSERT INTO DatasetVersion
        (dataset_id, version_number, version_label, parent_version_id, record_count, status, change_summary, schema_json, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, 'Active', ?, ?, ?, NOW())`,
      [
        datasetId,
        nextVersionNumber,
        versionLabel || `v${nextVersionNumber}`,
        latest.id,
        recordCount ?? latest.record_count,
        changeSummary,
        schemaJson,
        createdBy || 'system',
      ]
    );
    const newVersionId = result.insertId;
    const [newVersion] = await conn.query('SELECT * FROM DatasetVersion WHERE id = ?', [newVersionId]);

    // Auto-generate change log entries by diffing against the parent version
    const diff = compareVersions(latest, newVersion[0]);
    const logEntries = buildChangeLogEntries(diff, newVersionId, createdBy || 'system');
    for (const entry of logEntries) {
      await conn.query(
        `INSERT INTO DatasetChangeLog
          (version_id, change_type, field_name, old_value, new_value, description, changed_by, changed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entry.version_id,
          entry.change_type,
          entry.field_name,
          entry.old_value,
          entry.new_value,
          entry.description,
          entry.changed_by,
          entry.changed_at,
        ]
      );
    }

    await conn.commit();
    res.status(201).json({ success: true, message: 'New version created', data: { id: newVersionId, versionNumber: nextVersionNumber } });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

// GET /api/versions/compare?versionA=1&versionB=2
async function compareVersionsHandler(req, res, next) {
  try {
    const { versionA, versionB } = req.query;
    if (!versionA || !versionB) throw new AppError('versionA and versionB query params are required', 422);
    if (versionA === versionB) throw new AppError('Cannot compare a version with itself', 422);

    const vA = await fetchVersionOrThrow(pool, versionA);
    const vB = await fetchVersionOrThrow(pool, versionB);
    if (vA.dataset_id !== vB.dataset_id) {
      throw new AppError('Cannot compare versions belonging to different datasets', 422);
    }

    const diff = compareVersions(vA, vB);
    res.json({ success: true, data: diff });
  } catch (err) {
    next(err);
  }
}

// GET /api/datasets/:datasetId/change-history
async function getChangeHistory(req, res, next) {
  try {
    const { datasetId } = req.params;
    const [rows] = await pool.query(
      `SELECT dcl.*, dv.version_number, dv.version_label
       FROM DatasetChangeLog dcl
       JOIN DatasetVersion dv ON dv.id = dcl.version_id
       WHERE dv.dataset_id = ?
       ORDER BY dcl.changed_at DESC`,
      [datasetId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/datasets/:datasetId/lineage
async function getLineage(req, res, next) {
  try {
    const { datasetId } = req.params;
    const [versions] = await pool.query(
      'SELECT id, version_number, version_label, parent_version_id, status, created_by, created_at, change_summary FROM DatasetVersion WHERE dataset_id = ? ORDER BY version_number ASC',
      [datasetId]
    );
    if (!versions.length) throw new AppError(`Dataset ${datasetId} not found or has no versions`, 404);

    // Build parent -> children lineage edges for the UI to render as a graph/tree
    const edges = versions
      .filter((v) => v.parent_version_id)
      .map((v) => ({
        source: v.parent_version_id,
        target: v.id,
        sourceLabel: versions.find((p) => p.id === v.parent_version_id)?.version_label,
        targetLabel: v.version_label,
        transformation: v.change_summary,
        user: v.created_by,
        timestamp: v.created_at,
      }));

    res.json({ success: true, data: { nodes: versions, edges } });
  } catch (err) {
    next(err);
  }
}

// POST /api/versions/:id/restore
async function restoreVersion(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const { restoredBy } = req.body;

    await conn.beginTransaction();

    const target = await fetchVersionOrThrow(conn, id);
    const [[latest]] = await conn.query(
      'SELECT * FROM DatasetVersion WHERE dataset_id = ? ORDER BY version_number DESC LIMIT 1',
      [target.dataset_id]
    );

    if (target.id === latest.id) {
      throw new AppError('Cannot restore the version that is already the latest', 409);
    }

    const nextVersionNumber = latest.version_number + 1;

    await conn.query(
      "UPDATE DatasetVersion SET status = 'Archived' WHERE dataset_id = ? AND status = 'Active'",
      [target.dataset_id]
    );

    const [result] = await conn.query(
      `INSERT INTO DatasetVersion
        (dataset_id, version_number, version_label, parent_version_id, record_count, status, change_summary, schema_json, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, 'Restored', ?, ?, ?, NOW())`,
      [
        target.dataset_id,
        nextVersionNumber,
        `Restored from v${target.version_number}`,
        latest.id,
        target.record_count,
        `Restored contents of version ${target.version_number} (${target.version_label})`,
        target.schema_json,
        restoredBy || 'system',
      ]
    );
    const newVersionId = result.insertId;

    await conn.query(
      `INSERT INTO DatasetChangeLog (version_id, change_type, field_name, old_value, new_value, description, changed_by, changed_at)
       VALUES (?, 'VERSION_RESTORED', NULL, ?, ?, ?, ?, NOW())`,
      [
        newVersionId,
        String(latest.version_number),
        String(target.version_number),
        `Version ${target.version_number} restored as new version ${nextVersionNumber}. Newer versions (v${
          target.version_number + 1
        }–v${latest.version_number}) were preserved, not deleted.`,
        restoredBy || 'system',
      ]
    );

    await conn.commit();
    res.status(201).json({
      success: true,
      message: `Version ${target.version_number} restored as new version ${nextVersionNumber}`,
      data: { newVersionId, newVersionNumber: nextVersionNumber },
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

// PATCH /api/versions/:id/status
async function updateVersionStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, updatedBy } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      throw new AppError(`Invalid status '${status}'. Must be one of: ${VALID_STATUSES.join(', ')}`, 422);
    }
    const version = await fetchVersionOrThrow(pool, id);

    await pool.query('UPDATE DatasetVersion SET status = ? WHERE id = ?', [status, id]);
    await pool.query(
      `INSERT INTO DatasetChangeLog (version_id, change_type, field_name, old_value, new_value, description, changed_by, changed_at)
       VALUES (?, 'STATUS_CHANGED', 'status', ?, ?, ?, ?, NOW())`,
      [id, version.status, status, `Status changed from ${version.status} to ${status}`, updatedBy || 'system']
    );

    res.json({ success: true, message: 'Status updated', data: { id, status } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getVersions,
  getVersionDetails,
  createVersion,
  compareVersionsHandler,
  getChangeHistory,
  getLineage,
  restoreVersion,
  updateVersionStatus,
};
