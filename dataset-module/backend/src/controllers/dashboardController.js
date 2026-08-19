const { Dataset } = require('../models');
const { Op, fn, col } = require('sequelize');

async function dashboard(req, res, next) {
  try {
    const where = req.user.role === 'ADMIN' ? {} : { uploaded_by: req.user.id };

    const total = await Dataset.count({ where });
    const processed = await Dataset.count({ where: { ...where, status: 'PROCESSED' } });
    const pending = await Dataset.count({ where: { ...where, status: { [Op.in]: ['UPLOADED', 'VALIDATING', 'VALIDATED', 'PROCESSING'] } } });
    const validationFailed = await Dataset.count({ where: { ...where, status: 'VALIDATION_FAILED' } });
    const processingFailed = await Dataset.count({ where: { ...where, status: 'FAILED' } });

    const byStatusRaw = await Dataset.findAll({
      where,
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status']
    });
    const byFileTypeRaw = await Dataset.findAll({
      where,
      attributes: ['file_type', [fn('COUNT', col('id')), 'count']],
      group: ['file_type']
    });

    const recent = await Dataset.findAll({
      where,
      attributes: ['id', 'name', 'status', 'uploaded_at'],
      order: [['uploaded_at', 'DESC']],
      limit: 10
    });

    res.json({
      totals: {
        total_datasets: total,
        processed,
        pending_processing: pending,
        validation_failed: validationFailed,
        processing_failed: processingFailed
      },
      datasets_by_status: byStatusRaw.map((r) => ({ status: r.status, count: Number(r.get('count')) })),
      datasets_by_file_type: byFileTypeRaw.map((r) => ({ file_type: r.file_type, count: Number(r.get('count')) })),
      recent_datasets: recent
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { dashboard };
