const db = require('../config/db');
const { success, failure } = require('../utils/response');
const { getPagination, buildMeta } = require('../utils/pagination');
const { logAssetAction, getAssetHistory } = require('../services/assetHistoryService');

// GET /api/assets  (supports search, status filter, category filter, pagination)
async function getAssets(req, res) {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { search, status, category } = req.query;

    const where = [];
    const params = [];

    if (search) {
      where.push('(a.asset_name LIKE ? OR a.asset_code LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      where.push('a.status = ?');
      params.push(status);
    }
    if (category) {
      where.push('a.category = ?');
      params.push(category);
    }

    // Employees only see assets assigned to them
    if (req.user.role === 'employee') {
      where.push('a.assigned_to = ?');
      params.push(req.user.id);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await db.query(
      `SELECT a.*, u.name AS assigned_to_name
       FROM assets a
       LEFT JOIN users u ON a.assigned_to = u.id
       ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM assets a ${whereClause}`,
      params
    );

    return success(res, 200, 'Assets fetched successfully.', rows, buildMeta(page, limit, countRows[0].total));
  } catch (err) {
    console.error('getAssets error:', err);
    return failure(res, 500, 'Server error while fetching assets.');
  }
}

// GET /api/assets/:id
async function getAssetById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT a.*, u.name AS assigned_to_name
       FROM assets a
       LEFT JOIN users u ON a.assigned_to = u.id
       WHERE a.id = ?`,
      [id]
    );

    if (!rows.length) {
      return failure(res, 404, 'Asset not found.');
    }

    const asset = rows[0];

    if (req.user.role === 'employee' && asset.assigned_to !== req.user.id) {
      return failure(res, 403, 'You do not have access to this asset.');
    }

    const history = await getAssetHistory(id);

    return success(res, 200, 'Asset fetched successfully.', { ...asset, history });
  } catch (err) {
    console.error('getAssetById error:', err);
    return failure(res, 500, 'Server error while fetching asset.');
  }
}

// POST /api/assets  (admin only)
async function createAsset(req, res) {
  try {
    const { asset_name, asset_code, category, purchase_date, warranty_expiry, status, assigned_to } = req.body;

    if (!asset_name || !asset_code || !category) {
      return failure(res, 400, 'asset_name, asset_code and category are required.');
    }

    const [result] = await db.query(
      `INSERT INTO assets (asset_name, asset_code, category, purchase_date, warranty_expiry, status, assigned_to)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        asset_name,
        asset_code,
        category,
        purchase_date || null,
        warranty_expiry || null,
        status || 'active',
        assigned_to || null,
      ]
    );

    await logAssetAction(result.insertId, 'CREATED', `Asset "${asset_name}" was created.`, req.user.id);

    const [rows] = await db.query('SELECT * FROM assets WHERE id = ?', [result.insertId]);
    return success(res, 201, 'Asset created successfully.', rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return failure(res, 409, 'An asset with this asset_code already exists.');
    }
    console.error('createAsset error:', err);
    return failure(res, 500, 'Server error while creating asset.');
  }
}

// PUT /api/assets/:id  (admin only)
async function updateAsset(req, res) {
  try {
    const { id } = req.params;
    const { asset_name, asset_code, category, purchase_date, warranty_expiry, status, assigned_to } = req.body;

    const [existingRows] = await db.query('SELECT * FROM assets WHERE id = ?', [id]);
    if (!existingRows.length) {
      return failure(res, 404, 'Asset not found.');
    }
    const existing = existingRows[0];

    await db.query(
      `UPDATE assets SET
        asset_name = ?, asset_code = ?, category = ?, purchase_date = ?,
        warranty_expiry = ?, status = ?, assigned_to = ?
       WHERE id = ?`,
      [
        asset_name ?? existing.asset_name,
        asset_code ?? existing.asset_code,
        category ?? existing.category,
        purchase_date ?? existing.purchase_date,
        warranty_expiry ?? existing.warranty_expiry,
        status ?? existing.status,
        assigned_to ?? existing.assigned_to,
        id,
      ]
    );

    if (status && status !== existing.status) {
      await logAssetAction(id, 'STATUS_CHANGE', `Status changed from ${existing.status} to ${status}.`, req.user.id);
    }
    if (assigned_to !== undefined && assigned_to !== existing.assigned_to) {
      await logAssetAction(id, 'REASSIGNED', `Asset reassigned to user ID ${assigned_to}.`, req.user.id);
    }

    const [rows] = await db.query('SELECT * FROM assets WHERE id = ?', [id]);
    return success(res, 200, 'Asset updated successfully.', rows[0]);
  } catch (err) {
    console.error('updateAsset error:', err);
    return failure(res, 500, 'Server error while updating asset.');
  }
}

// DELETE /api/assets/:id  (admin only)
async function deleteAsset(req, res) {
  try {
    const { id } = req.params;
    const [existingRows] = await db.query('SELECT * FROM assets WHERE id = ?', [id]);
    if (!existingRows.length) {
      return failure(res, 404, 'Asset not found.');
    }

    await db.query('DELETE FROM assets WHERE id = ?', [id]);
    return success(res, 200, 'Asset deleted successfully.');
  } catch (err) {
    console.error('deleteAsset error:', err);
    return failure(res, 500, 'Server error while deleting asset.');
  }
}

module.exports = { getAssets, getAssetById, createAsset, updateAsset, deleteAsset };
