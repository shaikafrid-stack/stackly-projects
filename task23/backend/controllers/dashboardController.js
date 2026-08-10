const pool = require('../config/db');

async function getSummary() {
  const [[totals]] = await pool.query(
    `SELECT
      COUNT(*) AS total_datasets,
      SUM(status='Published') AS published,
      SUM(status='Draft') AS draft,
      SUM(status='Archived') AS archived
     FROM datasets`
  );
  const [[wsCount]] = await pool.query('SELECT COUNT(*) AS total_workspaces FROM workspaces');

  const [byCategory] = await pool.query(
    `SELECT COALESCE(category, 'Uncategorized') AS category, COUNT(*) AS count
     FROM datasets GROUP BY category`
  );

  const [byStatus] = await pool.query(
    `SELECT status, COUNT(*) AS count FROM datasets GROUP BY status`
  );

  const [byWorkspace] = await pool.query(
    `SELECT w.workspace_name, COUNT(d.id) AS count
     FROM workspaces w LEFT JOIN datasets d ON d.workspace_id = w.id
     GROUP BY w.id, w.workspace_name`
  );

  const [monthlyTrend] = await pool.query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
     FROM datasets
     GROUP BY DATE_FORMAT(created_at, '%Y-%m')
     ORDER BY month ASC`
  );

  return {
    cards: {
      totalDatasets: totals.total_datasets || 0,
      published: totals.published || 0,
      draft: totals.draft || 0,
      archived: totals.archived || 0,
      totalWorkspaces: wsCount.total_workspaces || 0,
    },
    charts: { byCategory, byStatus, byWorkspace, monthlyTrend },
  };
}

async function adminDashboard(req, res) {
  try {
    const summary = await getSummary();
    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error building admin dashboard.' });
  }
}

async function stewardDashboard(req, res) {
  try {
    const summary = await getSummary();
    const [myWorkspaces] = await pool.query(
      'SELECT id, workspace_name FROM workspaces WHERE steward_id = ?',
      [req.user.id]
    );
    res.json({ ...summary, myWorkspaces });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error building steward dashboard.' });
  }
}

async function analystDashboard(req, res) {
  try {
    const [[totals]] = await pool.query(
      `SELECT COUNT(*) AS total_datasets, SUM(status='Published') AS published FROM datasets`
    );
    const [byCategory] = await pool.query(
      `SELECT COALESCE(category, 'Uncategorized') AS category, COUNT(*) AS count
       FROM datasets WHERE status='Published' GROUP BY category`
    );
    const [favCount] = await pool.query(
      'SELECT COUNT(*) AS count FROM dataset_favorites WHERE user_id = ?',
      [req.user.id]
    );
    res.json({
      cards: {
        totalDatasets: totals.total_datasets || 0,
        published: totals.published || 0,
        favorites: favCount[0].count || 0,
      },
      charts: { byCategory },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error building analyst dashboard.' });
  }
}

module.exports = { adminDashboard, stewardDashboard, analystDashboard };
