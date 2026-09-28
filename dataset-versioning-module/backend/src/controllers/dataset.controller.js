const { pool } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

// GET /api/datasets - list all datasets with their active version summary
async function listDatasets(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT
        d.id, d.name, d.description, d.status, d.created_by, d.created_at,
        av.id AS active_version_id,
        av.version_number AS active_version_number,
        av.record_count AS active_record_count,
        av.created_at AS active_version_created_at,
        (SELECT COUNT(*) FROM DatasetVersion dv WHERE dv.dataset_id = d.id) AS total_versions
      FROM Dataset d
      LEFT JOIN DatasetVersion av
        ON av.dataset_id = d.id AND av.status = 'Active'
      ORDER BY d.created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/datasets/:id - dataset metadata + active version detail
async function getDataset(req, res, next) {
  try {
    const { id } = req.params;
    const [[dataset]] = await pool.query('SELECT * FROM Dataset WHERE id = ?', [id]);
    if (!dataset) throw new AppError(`Dataset ${id} not found`, 404);

    const [[activeVersion]] = await pool.query(
      "SELECT * FROM DatasetVersion WHERE dataset_id = ? AND status = 'Active' ORDER BY version_number DESC LIMIT 1",
      [id]
    );

    res.json({ success: true, data: { ...dataset, activeVersion: activeVersion || null } });
  } catch (err) {
    next(err);
  }
}

// POST /api/datasets - create a new dataset (Version 1 created implicitly)
async function createDataset(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const { name, description, createdBy, recordCount = 0, columns = [] } = req.body;
    if (!name) throw new AppError('Dataset name is required', 422);

    await conn.beginTransaction();

    const [existing] = await conn.query('SELECT id FROM Dataset WHERE name = ?', [name]);
    if (existing.length) throw new AppError(`A dataset named '${name}' already exists`, 409);

    const [dsResult] = await conn.query(
      'INSERT INTO Dataset (name, description, status, created_by, created_at) VALUES (?, ?, ?, ?, NOW())',
      [name, description || null, 'Active', createdBy || 'system']
    );
    const datasetId = dsResult.insertId;

    const schemaJson = JSON.stringify({ columns, transformations: [], validationRules: [] });

    await conn.query(
      `INSERT INTO DatasetVersion
        (dataset_id, version_number, version_label, parent_version_id, record_count, status, change_summary, schema_json, created_by, created_at)
       VALUES (?, 1, 'v1 - Initial Version', NULL, ?, 'Active', 'Initial dataset creation', ?, ?, NOW())`,
      [datasetId, recordCount, schemaJson, createdBy || 'system']
    );

    await conn.commit();
    res.status(201).json({ success: true, message: 'Dataset created', data: { id: datasetId } });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

// GET /api/dashboard/summary
async function getDashboardSummary(req, res, next) {
  try {
    const [[{ totalDatasets }]] = await pool.query('SELECT COUNT(*) AS totalDatasets FROM Dataset');
    const [[{ totalVersions }]] = await pool.query('SELECT COUNT(*) AS totalVersions FROM DatasetVersion');
    const [[{ activeVersions }]] = await pool.query(
      "SELECT COUNT(*) AS activeVersions FROM DatasetVersion WHERE status = 'Active'"
    );
    const [[{ archivedVersions }]] = await pool.query(
      "SELECT COUNT(*) AS archivedVersions FROM DatasetVersion WHERE status = 'Archived'"
    );
    const [recentlyModified] = await pool.query(`
      SELECT d.id, d.name, MAX(dv.created_at) AS last_modified
      FROM Dataset d
      JOIN DatasetVersion dv ON dv.dataset_id = d.id
      GROUP BY d.id, d.name
      ORDER BY last_modified DESC
      LIMIT 5
    `);
    const [recentChanges] = await pool.query(`
      SELECT dcl.id, dcl.change_type, dcl.description, dcl.changed_by, dcl.changed_at,
             dv.version_number, d.name AS dataset_name
      FROM DatasetChangeLog dcl
      JOIN DatasetVersion dv ON dv.id = dcl.version_id
      JOIN Dataset d ON d.id = dv.dataset_id
      ORDER BY dcl.changed_at DESC
      LIMIT 8
    `);

    res.json({
      success: true,
      data: { totalDatasets, totalVersions, activeVersions, archivedVersions, recentlyModified, recentChanges },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listDatasets, getDataset, createDataset, getDashboardSummary };
