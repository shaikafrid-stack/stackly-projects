const pool = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const { writePreparedData } = require('../utils/storage');
const engine = require('../services/transformationEngine');
const { computePreview, getDraftSteps, getDatasetOr404 } = require('./transformationController');

// GET /api/datasets/:id/versions
async function listVersions(req, res, next) {
  try {
    await getDatasetOr404(req.params.id);
    const [rows] = await pool.query(
      `SELECT v.*, u.name AS created_by_name
       FROM dataset_versions v LEFT JOIN users u ON u.id = v.created_by
       WHERE v.dataset_id = ? ORDER BY v.version_number ASC`,
      [req.params.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/datasets/:id/versions/:versionId
async function getVersion(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT v.*, u.name AS created_by_name FROM dataset_versions v LEFT JOIN users u ON u.id = v.created_by
       WHERE v.id = ? AND v.dataset_id = ?`,
      [req.params.versionId, req.params.id]
    );
    if (!rows[0]) throw new ApiError(404, 'Version not found.');

    const [transformations] = await pool.query(
      'SELECT * FROM transformations WHERE version_id = ? ORDER BY execution_order ASC',
      [rows[0].id]
    );
    const [validation] = await pool.query(
      'SELECT * FROM validation_results WHERE version_id = ? ORDER BY created_at DESC LIMIT 1',
      [rows[0].id]
    );

    res.json({ success: true, data: { ...rows[0], transformations, validation: validation[0] || null } });
  } catch (err) {
    next(err);
  }
}

// POST /api/datasets/:id/versions -> saves current draft as a new immutable prepared version
async function createVersion(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const { version_name: versionName, description } = req.body;
    if (!versionName) throw new ApiError(400, 'version_name is required.');

    const { dataset, result, stepResults } = await computePreview(req.params.id);
    const steps = await getDraftSteps(dataset.id);
    if (steps.length === 0) throw new ApiError(400, 'No transformations have been added. Add at least one transformation before saving a version.');

    // Run validation against the transformed result to store alongside the version
    const validation = engine.runValidation(result, []);

    await conn.beginTransaction();

    const [[{ maxVersion }]] = await conn.query(
      'SELECT COALESCE(MAX(version_number), 0) AS maxVersion FROM dataset_versions WHERE dataset_id = ?',
      [dataset.id]
    );
    const versionNumber = maxVersion + 1;
    const dataFileName = `dataset_${dataset.id}_v${versionNumber}.json`;
    writePreparedData(dataFileName, result);

    const status = validation.status === 'PASSED' ? 'VALID' : validation.status === 'FAILED' ? 'FAILED' : 'WARNING';

    const [versionResult] = await conn.query(
      `INSERT INTO dataset_versions (dataset_id, version_number, version_name, description, row_count, column_count, data_path, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [dataset.id, versionNumber, versionName, description || null, result.rows.length, result.columns.length, dataFileName, status, req.user.id]
    );
    const versionId = versionResult.insertId;

    // Attach draft transformation steps to this version (making them immutable)
    await conn.query('UPDATE transformations SET version_id = ? WHERE dataset_id = ? AND version_id IS NULL', [versionId, dataset.id]);

    // Write transformation_history entries
    for (let i = 0; i < steps.length; i += 1) {
      const stepResult = stepResults[i] || { status: 'SUCCESS', recordsAffected: 0, log: '' };
      await conn.query(
        `INSERT INTO transformation_history (dataset_id, version_id, transformation_id, status, records_affected, performed_by, details)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [dataset.id, versionId, steps[i].id, stepResult.status, stepResult.recordsAffected || 0, req.user.id, stepResult.log]
      );
    }

    // Persist the validation snapshot tied to this version
    await conn.query(
      `INSERT INTO validation_results (dataset_id, version_id, total_records, valid_records, invalid_records, null_values, duplicate_records, validation_status, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dataset.id, versionId, validation.totalRecords, validation.validRecords, validation.invalidRecords,
        validation.nullValues, validation.duplicateRecords, status, JSON.stringify(validation)
      ]
    );

    await conn.commit();

    const [rows] = await pool.query('SELECT * FROM dataset_versions WHERE id = ?', [versionId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

// DELETE /api/datasets/:id/versions/:versionId  (Admin only, enforced at route level)
async function deleteVersion(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM dataset_versions WHERE id = ? AND dataset_id = ?', [req.params.versionId, req.params.id]);
    if (!rows[0]) throw new ApiError(404, 'Version not found.');
    if (rows[0].version_number === 1) throw new ApiError(400, 'The original version cannot be deleted.');

    await pool.query('DELETE FROM dataset_versions WHERE id = ?', [rows[0].id]);
    res.json({ success: true, message: 'Prepared version deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listVersions, getVersion, createVersion, deleteVersion };
