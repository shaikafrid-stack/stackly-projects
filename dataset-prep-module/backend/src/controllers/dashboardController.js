const pool = require('../config/db');

async function getDashboard(req, res, next) {
  try {
    const [[datasetCounts]] = await pool.query(
      `SELECT COUNT(*) AS totalDatasets FROM datasets`
    );
    const [[preparedCounts]] = await pool.query(
      `SELECT COUNT(DISTINCT dataset_id) AS preparedDatasets FROM dataset_versions WHERE version_number > 1`
    );
    const [[runCounts]] = await pool.query(
      `SELECT COUNT(*) AS totalRuns,
              SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) AS successRuns,
              SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) AS failedRuns
       FROM transformation_history`
    );

    const [byType] = await pool.query(
      `SELECT t.transformation_type AS type, COUNT(*) AS count
       FROM transformation_history h
       LEFT JOIN transformations t ON t.id = h.transformation_id
       WHERE t.transformation_type IS NOT NULL
       GROUP BY t.transformation_type
       ORDER BY count DESC`
    );

    const [activity] = await pool.query(
      `SELECT DATE(executed_at) AS day, COUNT(*) AS runs, SUM(records_affected) AS recordsProcessed
       FROM transformation_history
       GROUP BY DATE(executed_at)
       ORDER BY day ASC
       LIMIT 30`
    );

    res.json({
      success: true,
      data: {
        summary: {
          totalDatasets: Number(datasetCounts.totalDatasets) || 0,
          preparedDatasets: Number(preparedCounts.preparedDatasets) || 0,
          transformationRuns: Number(runCounts.totalRuns) || 0,
          successfulTransformations: Number(runCounts.successRuns) || 0,
          failedTransformations: Number(runCounts.failedRuns) || 0
        },
        transformationsByType: byType.map((t) => ({ type: t.type, count: Number(t.count) })),
        successVsFailed: [
          { name: 'Successful', value: Number(runCounts.successRuns) || 0 },
          { name: 'Failed', value: Number(runCounts.failedRuns) || 0 }
        ],
        activity: activity.map((a) => ({ day: a.day, runs: Number(a.runs), recordsProcessed: Number(a.recordsProcessed) }))
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard };
