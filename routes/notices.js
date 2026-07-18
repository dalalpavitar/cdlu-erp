const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { target } = req.query;
    let sql = `SELECT n.*, t.name as posted_by_name
               FROM notices n
               LEFT JOIN teachers t ON n.posted_by = t.id
               WHERE 1=1`;
    const params = [];
    if (target && target !== 'all') { sql += ` AND (n.target = 'all' OR n.target = ?)`; params.push(target); }
    sql += ` ORDER BY n.created_at DESC LIMIT 50`;
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching notices:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', adminOnly, async (req, res) => {
  try {
    const { title, content, postedBy, priority, target } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    const [result] = await db.query(
      'INSERT INTO notices (title, content, posted_by, priority, target) VALUES (?, ?, ?, ?, ?)',
      [title, content || null, postedBy || null, priority || 'normal', target || 'all']
    );
    const [notice] = await db.query(
      'SELECT n.*, t.name as posted_by_name FROM notices n LEFT JOIN teachers t ON n.posted_by = t.id WHERE n.id = ?',
      [result.insertId]
    );
    res.json({ success: true, notice: notice[0] });
  } catch (err) {
    console.error('Error creating notice:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await db.query('DELETE FROM notices WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting notice:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
