const pool = require('../config/db');

// GET /api/datasets?search=&category=&status=&owner_id=&workspace_id=&page=&limit=
async function getDatasets(req, res) {
  try {
    const { search, category, status, owner_id, workspace_id, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where = [];
    let params = [];

    if (search) {
      where.push('(d.dataset_name LIKE ? OR d.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      where.push('d.category = ?');
      params.push(category);
    }
    if (status) {
      where.push('d.status = ?');
      params.push(status);
    }
    if (owner_id) {
      where.push('d.owner_id = ?');
      params.push(owner_id);
    }
    if (workspace_id) {
      where.push('d.workspace_id = ?');
      params.push(workspace_id);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT d.*, w.workspace_name, u.name AS owner_name
       FROM datasets d
       LEFT JOIN workspaces w ON d.workspace_id = w.id
       LEFT JOIN users u ON d.owner_id = u.id
       ${whereClause}
       ORDER BY d.updated_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM datasets d ${whereClause}`,
      params
    );

    // attach tags
    for (const row of rows) {
      const [tags] = await pool.query('SELECT id, tag_name FROM dataset_tags WHERE dataset_id = ?', [row.id]);
      row.tags = tags;
    }

    res.json({
      data: rows,
      pagination: {
        total: countRows[0].total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(countRows[0].total / Number(limit)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching datasets.' });
  }
}

async function getDatasetById(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, w.workspace_name, u.name AS owner_name
       FROM datasets d
       LEFT JOIN workspaces w ON d.workspace_id = w.id
       LEFT JOIN users u ON d.owner_id = u.id
       WHERE d.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Dataset not found.' });

    const [tags] = await pool.query('SELECT id, tag_name FROM dataset_tags WHERE dataset_id = ?', [req.params.id]);
    rows[0].tags = tags;

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching dataset.' });
  }
}

// POST /api/datasets  (Administrator, Data Steward)
async function createDataset(req, res) {
  try {
    const { workspace_id, dataset_name, description, category, owner_id, data_source, tags } = req.body;
    if (!workspace_id || !dataset_name) {
      return res.status(400).json({ message: 'workspace_id and dataset_name are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO datasets (workspace_id, dataset_name, description, category, owner_id, data_source, version, status)
       VALUES (?, ?, ?, ?, ?, ?, 'v1.0', 'Draft')`,
      [workspace_id, dataset_name, description || null, category || null, owner_id || null, data_source || null]
    );

    const datasetId = result.insertId;

    if (Array.isArray(tags)) {
      for (const tag of tags) {
        if (tag && tag.trim()) {
          await pool.query('INSERT INTO dataset_tags (dataset_id, tag_name) VALUES (?, ?)', [datasetId, tag.trim()]);
        }
      }
    }

    await pool.query(
      'INSERT INTO dataset_activity (dataset_id, user_id, activity, version) VALUES (?, ?, ?, ?)',
      [datasetId, req.user.id, 'Dataset registered', 'v1.0']
    );

    res.status(201).json({ message: 'Dataset created successfully.', id: datasetId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating dataset.' });
  }
}

// PUT /api/datasets/:id  (Administrator, Data Steward)
async function updateDataset(req, res) {
  try {
    const { id } = req.params;
    const [existingRows] = await pool.query('SELECT * FROM datasets WHERE id = ?', [id]);
    const existing = existingRows[0];
    if (!existing) return res.status(404).json({ message: 'Dataset not found.' });

    const {
      dataset_name = existing.dataset_name,
      description = existing.description,
      category = existing.category,
      owner_id = existing.owner_id,
      data_source = existing.data_source,
      status = existing.status,
      workspace_id = existing.workspace_id,
      bumpVersion = false,
    } = req.body;

    let newVersion = existing.version;
    if (bumpVersion) {
      const parts = existing.version.replace('v', '').split('.');
      const minor = parseInt(parts[1] || '0', 10) + 1;
      newVersion = `v${parts[0]}.${minor}`;
    }

    await pool.query(
      `UPDATE datasets SET dataset_name=?, description=?, category=?, owner_id=?, data_source=?, status=?, workspace_id=?, version=?
       WHERE id=?`,
      [dataset_name, description, category, owner_id, data_source, status, workspace_id, newVersion, id]
    );

    const activityMsg = bumpVersion
      ? `Metadata updated and version bumped to ${newVersion}`
      : 'Metadata updated';
    await pool.query(
      'INSERT INTO dataset_activity (dataset_id, user_id, activity, version) VALUES (?, ?, ?, ?)',
      [id, req.user.id, activityMsg, newVersion]
    );

    res.json({ message: 'Dataset updated successfully.', version: newVersion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating dataset.' });
  }
}

// DELETE /api/datasets/:id  (Administrator only - archives, does not hard-delete)
async function deleteDataset(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM datasets WHERE id = ?', [id]);
    if (!rows[0]) return res.status(404).json({ message: 'Dataset not found.' });

    await pool.query("UPDATE datasets SET status='Archived' WHERE id=?", [id]);
    await pool.query(
      'INSERT INTO dataset_activity (dataset_id, user_id, activity) VALUES (?, ?, ?)',
      [id, req.user.id, 'Dataset archived']
    );

    res.json({ message: 'Dataset archived successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting dataset.' });
  }
}

async function restoreDataset(req, res) {
  try {
    const { id } = req.params;
    await pool.query("UPDATE datasets SET status='Draft' WHERE id=?", [id]);
    await pool.query(
      'INSERT INTO dataset_activity (dataset_id, user_id, activity) VALUES (?, ?, ?)',
      [id, req.user.id, 'Dataset restored']
    );
    res.json({ message: 'Dataset restored successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error restoring dataset.' });
  }
}

// Favorites (optional feature)
async function toggleFavorite(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const [existing] = await pool.query(
      'SELECT id FROM dataset_favorites WHERE dataset_id = ? AND user_id = ?',
      [id, userId]
    );
    if (existing[0]) {
      await pool.query('DELETE FROM dataset_favorites WHERE id = ?', [existing[0].id]);
      return res.json({ favorited: false });
    }
    await pool.query('INSERT INTO dataset_favorites (dataset_id, user_id) VALUES (?, ?)', [id, userId]);
    res.json({ favorited: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating favorite.' });
  }
}

async function getFavorites(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, w.workspace_name FROM dataset_favorites f
       JOIN datasets d ON f.dataset_id = d.id
       LEFT JOIN workspaces w ON d.workspace_id = w.id
       WHERE f.user_id = ?`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching favorites.' });
  }
}

module.exports = {
  getDatasets,
  getDatasetById,
  createDataset,
  updateDataset,
  deleteDataset,
  restoreDataset,
  toggleFavorite,
  getFavorites,
};
