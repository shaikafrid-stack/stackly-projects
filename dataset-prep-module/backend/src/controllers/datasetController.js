const pool = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const { resolveVersionData } = require('../utils/storage');

async function listDatasets(req, res, next) {
  try {
    const { search = '', status = '', page = 1, limit = 10, sort = 'updated_at_desc' } = req.query;
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

    const where = [];
    const params = [];
    if (search) {
      where.push('(d.name LIKE ? OR d.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      where.push('d.status = ?');
      params.push(status);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sortMap = {
      updated_at_desc: 'd.updated_at DESC',
      updated_at_asc: 'd.updated_at ASC',
      name_asc: 'd.name ASC',
      name_desc: 'd.name DESC',
      quality_desc: 'd.quality_score DESC'
    };
    const orderBy = sortMap[sort] || sortMap.updated_at_desc;

    const [rows] = await pool.query(
      `SELECT d.*, u.name AS created_by_name,
        (SELECT COUNT(*) FROM dataset_versions v WHERE v.dataset_id = d.id) AS version_count
       FROM datasets d
       LEFT JOIN users u ON u.id = d.created_by
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM datasets d ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: rows,
      pagination: { total, page: parseInt(page, 10), limit: parseInt(limit, 10), totalPages: Math.ceil(total / limit) || 1 }
    });
  } catch (err) {
    next(err);
  }
}

async function getDataset(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, u.name AS created_by_name FROM datasets d LEFT JOIN users u ON u.id = d.created_by WHERE d.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) throw new ApiError(404, 'Dataset not found.');

    const [versions] = await pool.query(
      'SELECT * FROM dataset_versions WHERE dataset_id = ? ORDER BY version_number ASC',
      [req.params.id]
    );

    res.json({ success: true, data: { ...rows[0], versions } });
  } catch (err) {
    next(err);
  }
}

async function previewDataset(req, res, next) {
  try {
    const { versionId } = req.query;
    const [rows] = await pool.query('SELECT * FROM datasets WHERE id = ?', [req.params.id]);
    const dataset = rows[0];
    if (!dataset) throw new ApiError(404, 'Dataset not found.');
    if (dataset.status !== 'PROCESSED') {
      throw new ApiError(400, 'Dataset has not completed processing and is not available for preview/transformation.');
    }

    let version = null;
    if (versionId) {
      const [vrows] = await pool.query('SELECT * FROM dataset_versions WHERE id = ? AND dataset_id = ?', [versionId, req.params.id]);
      version = vrows[0];
      if (!version) throw new ApiError(404, 'Dataset version not found.');
    }

    const data = resolveVersionData(dataset, version);

    const columnStats = data.columns.map((col) => {
      const values = data.rows.map((r) => r[col.name]);
      const nullCount = values.filter((v) => v === null || v === undefined || v === '').length;
      const uniqueCount = new Set(values.map((v) => JSON.stringify(v))).size;
      return { name: col.name, dataType: col.dataType, nullCount, uniqueCount };
    });

    res.json({
      success: true,
      data: {
        columns: columnStats,
        totalRows: data.rows.length,
        records: data.rows.slice(0, 20)
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listDatasets, getDataset, previewDataset };
