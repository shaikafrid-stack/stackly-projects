const pool = require('../config/db');

async function getWorkspaces(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT w.*, u.name AS steward_name,
        (SELECT COUNT(*) FROM datasets d WHERE d.workspace_id = w.id) AS dataset_count
       FROM workspaces w
       LEFT JOIN users u ON w.steward_id = u.id
       ORDER BY w.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching workspaces.' });
  }
}

// Administrator only
async function createWorkspace(req, res) {
  try {
    const { workspace_name, description, steward_id } = req.body;
    if (!workspace_name) return res.status(400).json({ message: 'workspace_name is required.' });

    const [result] = await pool.query(
      'INSERT INTO workspaces (workspace_name, description, steward_id) VALUES (?, ?, ?)',
      [workspace_name, description || null, steward_id || null]
    );
    res.status(201).json({ message: 'Workspace created successfully.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating workspace.' });
  }
}

// Administrator only
async function updateWorkspace(req, res) {
  try {
    const { id } = req.params;
    const [existingRows] = await pool.query('SELECT * FROM workspaces WHERE id = ?', [id]);
    const existing = existingRows[0];
    if (!existing) return res.status(404).json({ message: 'Workspace not found.' });

    const {
      workspace_name = existing.workspace_name,
      description = existing.description,
      steward_id = existing.steward_id,
    } = req.body;

    await pool.query(
      'UPDATE workspaces SET workspace_name = ?, description = ?, steward_id = ? WHERE id = ?',
      [workspace_name, description, steward_id, id]
    );
    res.json({ message: 'Workspace updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating workspace.' });
  }
}

module.exports = { getWorkspaces, createWorkspace, updateWorkspace };
