const pool = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const { resolveVersionData, writePreparedData } = require('../utils/storage');
const engine = require('../services/transformationEngine');

async function getDatasetOr404(datasetId) {
  const [rows] = await pool.query('SELECT * FROM datasets WHERE id = ?', [datasetId]);
  if (!rows[0]) throw new ApiError(404, 'Dataset not found.');
  return rows[0];
}

/** Draft steps = transformations rows with version_id IS NULL for this dataset, in order. */
async function getDraftSteps(datasetId) {
  const [rows] = await pool.query(
    'SELECT * FROM transformations WHERE dataset_id = ? AND version_id IS NULL ORDER BY execution_order ASC',
    [datasetId]
  );
  return rows;
}

// POST /api/datasets/:id/transform  -> add a step to the draft builder
async function addTransformation(req, res, next) {
  try {
    const dataset = await getDatasetOr404(req.params.id);
    if (dataset.status !== 'PROCESSED') throw new ApiError(400, 'Dataset is not available for transformation.');

    const { transformation_type: type, column_name: column, configuration } = req.body;
    if (!type) throw new ApiError(400, 'transformation_type is required.');
    if (!engine.TRANSFORM_HANDLERS[type]) throw new ApiError(400, `Unsupported transformation_type: ${type}`);

    const existing = await getDraftSteps(dataset.id);
    const nextOrder = existing.length ? existing[existing.length - 1].execution_order + 1 : 1;

    const [result] = await pool.query(
      `INSERT INTO transformations (dataset_id, version_id, transformation_type, column_name, configuration, execution_order, created_by)
       VALUES (?, NULL, ?, ?, ?, ?, ?)`,
      [dataset.id, type, column || null, JSON.stringify(configuration || {}), nextOrder, req.user.id]
    );

    const [rows] = await pool.query('SELECT * FROM transformations WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

// GET /api/datasets/:id/transformations -> list draft steps
async function listTransformations(req, res, next) {
  try {
    await getDatasetOr404(req.params.id);
    const steps = await getDraftSteps(req.params.id);
    res.json({ success: true, data: steps });
  } catch (err) {
    next(err);
  }
}

// PUT /api/transformations/:stepId -> edit a draft step
async function updateTransformation(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM transformations WHERE id = ?', [req.params.stepId]);
    const step = rows[0];
    if (!step) throw new ApiError(404, 'Transformation step not found.');
    if (step.version_id) throw new ApiError(400, 'Cannot edit a transformation that already belongs to a saved version.');

    const { column_name: column, configuration } = req.body;
    await pool.query(
      'UPDATE transformations SET column_name = ?, configuration = ? WHERE id = ?',
      [column ?? step.column_name, JSON.stringify(configuration ?? JSON.parse(step.configuration || '{}')), step.id]
    );
    const [updated] = await pool.query('SELECT * FROM transformations WHERE id = ?', [step.id]);
    res.json({ success: true, data: updated[0] });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/transformations/:stepId -> remove a draft step
async function deleteTransformation(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM transformations WHERE id = ?', [req.params.stepId]);
    const step = rows[0];
    if (!step) throw new ApiError(404, 'Transformation step not found.');
    if (step.version_id) throw new ApiError(400, 'Cannot delete a transformation that already belongs to a saved version.');

    await pool.query('DELETE FROM transformations WHERE id = ?', [step.id]);
    // Re-sequence execution_order for remaining draft steps
    const remaining = await getDraftSteps(step.dataset_id);
    await Promise.all(
      remaining.map((r, idx) => pool.query('UPDATE transformations SET execution_order = ? WHERE id = ?', [idx + 1, r.id]))
    );
    res.json({ success: true, message: 'Transformation step removed.' });
  } catch (err) {
    next(err);
  }
}

// PUT /api/datasets/:id/transformations/reorder  { orderedIds: [3,1,2] }
async function reorderTransformations(req, res, next) {
  try {
    const dataset = await getDatasetOr404(req.params.id);
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) throw new ApiError(400, 'orderedIds array is required.');

    await Promise.all(
      orderedIds.map((id, idx) =>
        pool.query('UPDATE transformations SET execution_order = ? WHERE id = ? AND dataset_id = ? AND version_id IS NULL', [idx + 1, id, dataset.id])
      )
    );
    const steps = await getDraftSteps(dataset.id);
    res.json({ success: true, data: steps });
  } catch (err) {
    next(err);
  }
}

/** Shared helper: run the draft pipeline against the dataset's Original data and return before/after */
async function computePreview(datasetId) {
  const dataset = await getDatasetOr404(datasetId);
  const original = resolveVersionData(dataset, null);
  const steps = await getDraftSteps(datasetId);
  const { result, stepResults } = engine.runPipeline(original, steps);

  const modifiedValues = stepResults.reduce((sum, s) => sum + (s.recordsAffected || 0), 0);
  const removedRows = Math.max(0, original.rows.length - result.rows.length);

  return {
    dataset,
    original,
    result,
    steps,
    stepResults,
    summary: {
      originalRecordCount: original.rows.length,
      updatedRecordCount: result.rows.length,
      originalColumnCount: original.columns.length,
      updatedColumnCount: result.columns.length,
      modifiedValues,
      removedRows
    }
  };
}

// POST /api/datasets/:id/transformations/preview
async function previewTransformations(req, res, next) {
  try {
    const { original, result, stepResults, summary } = await computePreview(req.params.id);
    res.json({
      success: true,
      data: {
        summary,
        stepResults,
        before: { columns: original.columns, sample: original.rows.slice(0, 10) },
        after: { columns: result.columns, sample: result.rows.slice(0, 10) }
      }
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/datasets/:id/validate  -> validate the current draft pipeline result
async function validateDataset(req, res, next) {
  try {
    const { requiredColumns = [] } = req.body || {};
    const { dataset, result } = await computePreview(req.params.id);
    const validation = engine.runValidation(result, requiredColumns);

    const [insertResult] = await pool.query(
      `INSERT INTO validation_results (dataset_id, version_id, total_records, valid_records, invalid_records, null_values, duplicate_records, validation_status, details)
       VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dataset.id,
        validation.totalRecords,
        validation.validRecords,
        validation.invalidRecords,
        validation.nullValues,
        validation.duplicateRecords,
        validation.status === 'PASSED' ? 'PASSED' : validation.status === 'FAILED' ? 'FAILED' : 'WARNING',
        JSON.stringify(validation)
      ]
    );

    const [rows] = await pool.query('SELECT * FROM validation_results WHERE id = ?', [insertResult.insertId]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

// GET /api/datasets/:id/validation-results
async function getValidationResults(req, res, next) {
  try {
    await getDatasetOr404(req.params.id);
    const [rows] = await pool.query(
      'SELECT * FROM validation_results WHERE dataset_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.params.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addTransformation,
  listTransformations,
  updateTransformation,
  deleteTransformation,
  reorderTransformations,
  previewTransformations,
  validateDataset,
  getValidationResults,
  computePreview,
  getDraftSteps,
  getDatasetOr404
};
