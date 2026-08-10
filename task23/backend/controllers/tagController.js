const pool = require('../config/db');

async function getTags(req, res) {
  try {
    const [rows] = await pool.query('SELECT id, tag_name FROM dataset_tags WHERE dataset_id = ?', [
      req.params.id,
    ]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching tags.' });
  }
}

async function addTag(req, res) {
  try {
    const { id } = req.params;
    const { tag_name } = req.body;
    if (!tag_name || !tag_name.trim()) {
      return res.status(400).json({ message: 'tag_name is required.' });
    }
    const [result] = await pool.query('INSERT INTO dataset_tags (dataset_id, tag_name) VALUES (?, ?)', [
      id,
      tag_name.trim(),
    ]);
    res.status(201).json({ id: result.insertId, tag_name: tag_name.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error adding tag.' });
  }
}

async function deleteTag(req, res) {
  try {
    const { tagId } = req.params;
    await pool.query('DELETE FROM dataset_tags WHERE id = ?', [tagId]);
    res.json({ message: 'Tag removed successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error removing tag.' });
  }
}

module.exports = { getTags, addTag, deleteTag };
