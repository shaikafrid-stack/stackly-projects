const db = require('../config/db');
const { success, failure } = require('../utils/response');

// GET /api/dashboard/admin
async function adminDashboard(req, res) {
  try {
    const [[{ totalAssets }]] = await db.query('SELECT COUNT(*) AS totalAssets FROM assets');
    const [[{ totalRequests }]] = await db.query('SELECT COUNT(*) AS totalRequests FROM service_requests');
    const [[{ openRequests }]] = await db.query(
      "SELECT COUNT(*) AS openRequests FROM service_requests WHERE status IN ('Open','Assigned','In Progress')"
    );
    const [[{ criticalRequests }]] = await db.query(
      "SELECT COUNT(*) AS criticalRequests FROM service_requests WHERE priority = 'Critical' AND status NOT IN ('Resolved','Closed')"
    );

    const [requestsByStatus] = await db.query(
      'SELECT status, COUNT(*) AS count FROM service_requests GROUP BY status'
    );

    const [requestsByPriority] = await db.query(
      'SELECT priority, COUNT(*) AS count FROM service_requests GROUP BY priority'
    );

    const [monthlyTrends] = await db.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
       FROM service_requests
       GROUP BY month
       ORDER BY month ASC
       LIMIT 12`
    );

    const [assetCategoryDistribution] = await db.query(
      'SELECT category, COUNT(*) AS count FROM assets GROUP BY category'
    );

    const [engineerResolutionCount] = await db.query(
      `SELECT u.name AS engineer_name, COUNT(*) AS resolved_count
       FROM service_requests sr
       JOIN users u ON sr.assigned_engineer_id = u.id
       WHERE sr.status IN ('Resolved', 'Closed')
       GROUP BY sr.assigned_engineer_id, u.name
       ORDER BY resolved_count DESC`
    );

    const [assetsByStatus] = await db.query(
      'SELECT status, COUNT(*) AS count FROM assets GROUP BY status'
    );

    return success(res, 200, 'Admin dashboard data fetched successfully.', {
      summary: { totalAssets, totalRequests, openRequests, criticalRequests },
      requestsByStatus,
      requestsByPriority,
      monthlyTrends,
      assetCategoryDistribution,
      engineerResolutionCount,
      assetsByStatus,
    });
  } catch (err) {
    console.error('adminDashboard error:', err);
    return failure(res, 500, 'Server error while fetching admin dashboard.');
  }
}

// GET /api/dashboard/maintenance  (scoped to logged-in engineer)
async function maintenanceDashboard(req, res) {
  try {
    const engineerId = req.user.id;

    const [[{ assignedCount }]] = await db.query(
      "SELECT COUNT(*) AS assignedCount FROM service_requests WHERE assigned_engineer_id = ? AND status = 'Assigned'",
      [engineerId]
    );
    const [[{ inProgressCount }]] = await db.query(
      "SELECT COUNT(*) AS inProgressCount FROM service_requests WHERE assigned_engineer_id = ? AND status = 'In Progress'",
      [engineerId]
    );
    const [[{ resolvedCount }]] = await db.query(
      "SELECT COUNT(*) AS resolvedCount FROM service_requests WHERE assigned_engineer_id = ? AND status IN ('Resolved','Closed')",
      [engineerId]
    );

    const [requestsByPriority] = await db.query(
      'SELECT priority, COUNT(*) AS count FROM service_requests WHERE assigned_engineer_id = ? GROUP BY priority',
      [engineerId]
    );

    const [recentRequests] = await db.query(
      `SELECT sr.*, a.asset_name, a.asset_code
       FROM service_requests sr
       JOIN assets a ON sr.asset_id = a.id
       WHERE sr.assigned_engineer_id = ?
       ORDER BY sr.updated_at DESC
       LIMIT 10`,
      [engineerId]
    );

    return success(res, 200, 'Maintenance dashboard data fetched successfully.', {
      summary: { assignedCount, inProgressCount, resolvedCount },
      requestsByPriority,
      recentRequests,
    });
  } catch (err) {
    console.error('maintenanceDashboard error:', err);
    return failure(res, 500, 'Server error while fetching maintenance dashboard.');
  }
}

// GET /api/dashboard/employee  (scoped to logged-in employee)
async function employeeDashboard(req, res) {
  try {
    const employeeId = req.user.id;

    const [[{ myAssetsCount }]] = await db.query(
      'SELECT COUNT(*) AS myAssetsCount FROM assets WHERE assigned_to = ?',
      [employeeId]
    );
    const [[{ myOpenRequests }]] = await db.query(
      "SELECT COUNT(*) AS myOpenRequests FROM service_requests WHERE employee_id = ? AND status NOT IN ('Resolved','Closed')",
      [employeeId]
    );
    const [[{ myResolvedRequests }]] = await db.query(
      "SELECT COUNT(*) AS myResolvedRequests FROM service_requests WHERE employee_id = ? AND status IN ('Resolved','Closed')",
      [employeeId]
    );

    const [myRequestsByStatus] = await db.query(
      'SELECT status, COUNT(*) AS count FROM service_requests WHERE employee_id = ? GROUP BY status',
      [employeeId]
    );

    const [recentRequests] = await db.query(
      `SELECT sr.*, a.asset_name, a.asset_code
       FROM service_requests sr
       JOIN assets a ON sr.asset_id = a.id
       WHERE sr.employee_id = ?
       ORDER BY sr.created_at DESC
       LIMIT 10`,
      [employeeId]
    );

    return success(res, 200, 'Employee dashboard data fetched successfully.', {
      summary: { myAssetsCount, myOpenRequests, myResolvedRequests },
      myRequestsByStatus,
      recentRequests,
    });
  } catch (err) {
    console.error('employeeDashboard error:', err);
    return failure(res, 500, 'Server error while fetching employee dashboard.');
  }
}

module.exports = { adminDashboard, maintenanceDashboard, employeeDashboard };
