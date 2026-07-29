const pool = require('../config/db');

// GET /api/categories  (available to all authenticated users, e.g. for dropdowns)
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ticket_categories ORDER BY category_name ASC');
    res.json(rows);
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ message: 'Server error while fetching categories.' });
  }
};

// POST /api/categories  (admin only)
exports.createCategory = async (req, res) => {
  try {
    const { category_name, description } = req.body;
    if (!category_name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }
    const [existing] = await pool.query(
      'SELECT id FROM ticket_categories WHERE category_name = ?',
      [category_name]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'A category with this name already exists.' });
    }
    const [result] = await pool.query(
      'INSERT INTO ticket_categories (category_name, description) VALUES (?, ?)',
      [category_name, description || null]
    );
    res.status(201).json({ message: 'Category created successfully.', categoryId: result.insertId });
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ message: 'Server error while creating category.' });
  }
};

// PUT /api/categories/:id  (admin only)
exports.updateCategory = async (req, res) => {
  try {
    const { category_name, description } = req.body;
    const updates = [];
    const params = [];
    if (category_name) { updates.push('category_name = ?'); params.push(category_name); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update.' });
    }
    params.push(req.params.id);
    const [result] = await pool.query(
      `UPDATE ticket_categories SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Category not found.' });
    res.json({ message: 'Category updated successfully.' });
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ message: 'Server error while updating category.' });
  }
};

// DELETE /api/categories/:id  (admin only)
exports.deleteCategory = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM ticket_categories WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Category not found.' });
    res.json({ message: 'Category deleted successfully.' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ message: 'Server error while deleting category.' });
  }
};
