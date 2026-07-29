const pool = require('../config/db');

// GET /api/articles  (search + filter by category, available to all authenticated users)
exports.getArticles = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;
    const where = [];
    const params = [];

    if (search) {
      where.push('(title LIKE ? OR content LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      where.push('category = ?');
      params.push(category);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const offset = (pageNum - 1) * pageSize;

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM knowledge_base ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT kb.*, u.name AS author_name
       FROM knowledge_base kb
       JOIN users u ON u.id = kb.created_by
       ${whereClause}
       ORDER BY kb.updated_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.json({
      data: rows,
      pagination: { page: pageNum, limit: pageSize, total, totalPages: Math.ceil(total / pageSize) || 1 },
    });
  } catch (err) {
    console.error('Get articles error:', err);
    res.status(500).json({ message: 'Server error while fetching articles.' });
  }
};

// GET /api/articles/:id
exports.getArticleById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT kb.*, u.name AS author_name FROM knowledge_base kb
       JOIN users u ON u.id = kb.created_by WHERE kb.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Article not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Get article error:', err);
    res.status(500).json({ message: 'Server error while fetching article.' });
  }
};

// POST /api/articles  (support_engineer, admin)
exports.createArticle = async (req, res) => {
  try {
    const { title, category, content } = req.body;
    if (!title || !category || !content) {
      return res.status(400).json({ message: 'Title, category and content are required.' });
    }
    const [result] = await pool.query(
      'INSERT INTO knowledge_base (title, category, content, created_by) VALUES (?, ?, ?, ?)',
      [title, category, content, req.user.id]
    );
    res.status(201).json({ message: 'Article created successfully.', articleId: result.insertId });
  } catch (err) {
    console.error('Create article error:', err);
    res.status(500).json({ message: 'Server error while creating article.' });
  }
};

// PUT /api/articles/:id  (support_engineer, admin)
exports.updateArticle = async (req, res) => {
  try {
    const { title, category, content } = req.body;
    const [rows] = await pool.query('SELECT * FROM knowledge_base WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Article not found.' });

    const updates = [];
    const params = [];
    if (title) { updates.push('title = ?'); params.push(title); }
    if (category) { updates.push('category = ?'); params.push(category); }
    if (content) { updates.push('content = ?'); params.push(content); }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update.' });
    }
    params.push(req.params.id);
    await pool.query(`UPDATE knowledge_base SET ${updates.join(', ')} WHERE id = ?`, params);
    res.json({ message: 'Article updated successfully.' });
  } catch (err) {
    console.error('Update article error:', err);
    res.status(500).json({ message: 'Server error while updating article.' });
  }
};

// DELETE /api/articles/:id  (admin only)
exports.deleteArticle = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM knowledge_base WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Article not found.' });
    res.json({ message: 'Article deleted successfully.' });
  } catch (err) {
    console.error('Delete article error:', err);
    res.status(500).json({ message: 'Server error while deleting article.' });
  }
};
