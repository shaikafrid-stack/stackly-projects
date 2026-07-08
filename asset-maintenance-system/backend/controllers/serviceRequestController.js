const db = require('../config/db');
const { success, failure } = require('../utils/response');
const { getPagination, buildMeta } = require('../utils/pagination');
const { logAssetAction } = require('../services/assetHistoryService');

const VALID_STATUSES = ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

// POST /api/service-requests  (employee)
async function createServiceRequest(req, res) {
  try {
    const { asset_id, issue_title, issue_description, priority } = req.body;

    if (!asset_id || !issue_title) {
      return failure(res, 400, 'asset_id and issue_title are required.');
    }
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return failure(res, 400, `priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
    }

    const [assetRows] = await db.query('SELECT * FROM assets WHERE id = ?', [asset_id]);
    if (!assetRows.length) {
      return failure(res, 404, 'Asset not found.');
    }

    const [result] = await db.query(
      `INSERT INTO service_requests (employee_id, asset_id, issue_title, issue_description, priority, status)
       VALUES (?, ?, ?, ?, ?, 'Open')`,
      [req.user.id, asset_id, issue_title, issue_description || null, priority || 'Medium']
    );

    await logAssetAction(
      asset_id,
      'SERVICE_REQUEST_RAISED',
      `Service request "${issue_title}" raised.`,
      req.user.id
    );

    const [rows] = await db.query('SELECT * FROM service_requests WHERE id = ?', [result.insertId]);
    return success(res, 201, 'Service request created successfully.', rows[0]);
  } catch (err) {
    console.error('createServiceRequest error:', err);
    return failure(res, 500, 'Server error while creating service request.');
  }
}

// GET /api/service-requests  (role-scoped, search/filter/pagination)
async function getServiceRequests(req, res) {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { search, status, priority } = req.query;

    const where = [];
    const params = [];

    if (req.user.role === 'employee') {
      where.push('sr.employee_id = ?');
      params.push(req.user.id);
    } else if (req.user.role === 'maintenance_engineer') {
      where.push('sr.assigned_engineer_id = ?');
      params.push(req.user.id);
    }
    // admin sees all

    if (search) {
      where.push('(sr.issue_title LIKE ? OR sr.issue_description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      where.push('sr.status = ?');
      params.push(status);
    }
    if (priority) {
      where.push('sr.priority = ?');
      params.push(priority);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await db.query(
      `SELECT sr.*,
              a.asset_name, a.asset_code,
              e.name AS employee_name,
              eng.name AS engineer_name
       FROM service_requests sr
       JOIN assets a ON sr.asset_id = a.id
       JOIN users e ON sr.employee_id = e.id
       LEFT JOIN users eng ON sr.assigned_engineer_id = eng.id
       ${whereClause}
       ORDER BY sr.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM service_requests sr ${whereClause}`,
      params
    );

    return success(
      res,
      200,
      'Service requests fetched successfully.',
      rows,
      buildMeta(page, limit, countRows[0].total)
    );
  } catch (err) {
    console.error('getServiceRequests error:', err);
    return failure(res, 500, 'Server error while fetching service requests.');
  }
}

// GET /api/service-requests/:id
async function getServiceRequestById(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT sr.*,
              a.asset_name, a.asset_code,
              e.name AS employee_name,
              eng.name AS engineer_name
       FROM service_requests sr
       JOIN assets a ON sr.asset_id = a.id
       JOIN users e ON sr.employee_id = e.id
       LEFT JOIN users eng ON sr.assigned_engineer_id = eng.id
       WHERE sr.id = ?`,
      [id]
    );

    if (!rows.length) {
      return failure(res, 404, 'Service request not found.');
    }
    const request = rows[0];

    if (req.user.role === 'employee' && request.employee_id !== req.user.id) {
      return failure(res, 403, 'You do not have access to this service request.');
    }
    if (req.user.role === 'maintenance_engineer' && request.assigned_engineer_id !== req.user.id) {
      return failure(res, 403, 'You do not have access to this service request.');
    }

    const [logs] = await db.query(
      `SELECT ml.*, u.name AS engineer_name
       FROM maintenance_logs ml
       JOIN users u ON ml.engineer_id = u.id
       WHERE ml.request_id = ?
       ORDER BY ml.resolved_at DESC`,
      [id]
    );

    return success(res, 200, 'Service request fetched successfully.', { ...request, maintenance_logs: logs });
  } catch (err) {
    console.error('getServiceRequestById error:', err);
    return failure(res, 500, 'Server error while fetching service request.');
  }
}

// PUT /api/service-requests/:id
// Employees: none (read only after creation)
// Engineers: can update status (Assigned -> In Progress -> Resolved) on their own requests
// Admin: can assign engineers, change priority/status
async function updateServiceRequest(req, res) {
  try {
    const { id } = req.params;
    const { status, priority, assigned_engineer_id } = req.body;

    const [existingRows] = await db.query('SELECT * FROM service_requests WHERE id = ?', [id]);
    if (!existingRows.length) {
      return failure(res, 404, 'Service request not found.');
    }
    const existing = existingRows[0];

    if (status && !VALID_STATUSES.includes(status)) {
      return failure(res, 400, `status must be one of: ${VALID_STATUSES.join(', ')}`);
    }
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return failure(res, 400, `priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
    }

    if (req.user.role === 'employee') {
      return failure(res, 403, 'Employees cannot update service requests.');
    }

    if (req.user.role === 'maintenance_engineer') {
      if (existing.assigned_engineer_id !== req.user.id) {
        return failure(res, 403, 'You can only update requests assigned to you.');
      }
      if (assigned_engineer_id || priority) {
        return failure(res, 403, 'Engineers can only update the request status.');
      }
      if (status === 'Resolved') {
        // Validation: a maintenance log must exist before marking resolved
        const [logRows] = await db.query(
          'SELECT * FROM maintenance_logs WHERE request_id = ? ORDER BY resolved_at DESC LIMIT 1',
          [id]
        );
        if (!logRows.length) {
          return failure(
            res,
            400,
            'A maintenance log with a resolution summary must be added before marking this request as Resolved.'
          );
        }
      }
    }

    // Admin assigning an engineer moves status to "Assigned" automatically
    let newStatus = status ?? existing.status;
    if (req.user.role === 'admin' && assigned_engineer_id && !status) {
      newStatus = 'Assigned';
    }

    await db.query(
      `UPDATE service_requests
       SET status = ?, priority = ?, assigned_engineer_id = ?
       WHERE id = ?`,
      [
        newStatus,
        priority ?? existing.priority,
        assigned_engineer_id ?? existing.assigned_engineer_id,
        id,
      ]
    );

    if (assigned_engineer_id && assigned_engineer_id !== existing.assigned_engineer_id) {
      await logAssetAction(
        existing.asset_id,
        'ENGINEER_ASSIGNED',
        `Engineer ID ${assigned_engineer_id} assigned to service request #${id}.`,
        req.user.id
      );
    }
    if (newStatus !== existing.status) {
      await logAssetAction(
        existing.asset_id,
        'REQUEST_STATUS_CHANGE',
        `Service request #${id} status changed from ${existing.status} to ${newStatus}.`,
        req.user.id
      );
      if (newStatus === 'In Progress') {
        await db.query('UPDATE assets SET status = ? WHERE id = ?', ['in_maintenance', existing.asset_id]);
      }
      if (newStatus === 'Closed' || newStatus === 'Resolved') {
        await db.query(
          'UPDATE assets SET status = ? WHERE id = ? AND status = ?',
          ['active', existing.asset_id, 'in_maintenance']
        );
      }
    }

    const [rows] = await db.query('SELECT * FROM service_requests WHERE id = ?', [id]);
    return success(res, 200, 'Service request updated successfully.', rows[0]);
  } catch (err) {
    console.error('updateServiceRequest error:', err);
    return failure(res, 500, 'Server error while updating service request.');
  }
}

// DELETE /api/service-requests/:id  (admin only)
async function deleteServiceRequest(req, res) {
  try {
    const { id } = req.params;
    const [existingRows] = await db.query('SELECT * FROM service_requests WHERE id = ?', [id]);
    if (!existingRows.length) {
      return failure(res, 404, 'Service request not found.');
    }
    await db.query('DELETE FROM service_requests WHERE id = ?', [id]);
    return success(res, 200, 'Service request deleted successfully.');
  } catch (err) {
    console.error('deleteServiceRequest error:', err);
    return failure(res, 500, 'Server error while deleting service request.');
  }
}

module.exports = {
  createServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  updateServiceRequest,
  deleteServiceRequest,
};
