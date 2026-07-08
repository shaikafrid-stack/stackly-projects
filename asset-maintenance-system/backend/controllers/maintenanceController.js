const db = require('../config/db');
const { success, failure } = require('../utils/response');
const { getPagination, buildMeta } = require('../utils/pagination');

// POST /api/maintenance-logs  (maintenance engineer only, must own the request)
async function createMaintenanceLog(req, res) {
  try {
    const { request_id, maintenance_notes, resolution_summary, mark_resolved } = req.body;

    if (!request_id) {
      return failure(res, 400, 'request_id is required.');
    }

    const [requestRows] = await db.query('SELECT * FROM service_requests WHERE id = ?', [request_id]);
    if (!requestRows.length) {
      return failure(res, 404, 'Service request not found.');
    }
    const request = requestRows[0];

    if (request.assigned_engineer_id !== req.user.id) {
      return failure(res, 403, 'You can only add logs for requests assigned to you.');
    }

    if (mark_resolved && !resolution_summary) {
      return failure(res, 400, 'resolution_summary is required to mark a request as resolved.');
    }

    const [result] = await db.query(
      `INSERT INTO maintenance_logs (request_id, engineer_id, maintenance_notes, resolution_summary, resolved_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        request_id,
        req.user.id,
        maintenance_notes || null,
        resolution_summary || null,
        mark_resolved ? new Date() : null,
      ]
    );

    if (mark_resolved) {
      await db.query('UPDATE service_requests SET status = ? WHERE id = ?', ['Resolved', request_id]);
      await db.query(
        'UPDATE assets SET status = ? WHERE id = ? AND status = ?',
        ['active', request.asset_id, 'in_maintenance']
      );
    } else if (request.status === 'Assigned') {
      await db.query('UPDATE service_requests SET status = ? WHERE id = ?', ['In Progress', request_id]);
    }

    const [rows] = await db.query('SELECT * FROM maintenance_logs WHERE id = ?', [result.insertId]);
    return success(res, 201, 'Maintenance log created successfully.', rows[0]);
  } catch (err) {
    console.error('createMaintenanceLog error:', err);
    return failure(res, 500, 'Server error while creating maintenance log.');
  }
}

// GET /api/maintenance-logs (role-scoped, filterable by request_id, paginated)
async function getMaintenanceLogs(req, res) {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { request_id } = req.query;

    const where = [];
    const params = [];

    if (request_id) {
      where.push('ml.request_id = ?');
      params.push(request_id);
    }
    if (req.user.role === 'maintenance_engineer') {
      where.push('ml.engineer_id = ?');
      params.push(req.user.id);
    } else if (req.user.role === 'employee') {
      where.push('sr.employee_id = ?');
      params.push(req.user.id);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await db.query(
      `SELECT ml.*, u.name AS engineer_name, sr.issue_title, sr.asset_id
       FROM maintenance_logs ml
       JOIN users u ON ml.engineer_id = u.id
       JOIN service_requests sr ON ml.request_id = sr.id
       ${whereClause}
       ORDER BY ml.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM maintenance_logs ml
       JOIN service_requests sr ON ml.request_id = sr.id
       ${whereClause}`,
      params
    );

    return success(
      res,
      200,
      'Maintenance logs fetched successfully.',
      rows,
      buildMeta(page, limit, countRows[0].total)
    );
  } catch (err) {
    console.error('getMaintenanceLogs error:', err);
    return failure(res, 500, 'Server error while fetching maintenance logs.');
  }
}

module.exports = { createMaintenanceLog, getMaintenanceLogs };
