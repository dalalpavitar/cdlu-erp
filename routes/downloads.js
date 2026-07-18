const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM downloads ORDER BY uploaded_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Downloads error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/category/:cat', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM downloads WHERE category = ? ORDER BY uploaded_at DESC', [req.params.cat]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', adminOnly, async (req, res) => {
  try {
    const { title, description, file_url, category, file_size } = req.body;
    const [result] = await db.query(
      'INSERT INTO downloads (title, description, file_url, category, file_size) VALUES (?, ?, ?, ?, ?)',
      [title, description, file_url, category, file_size]
    );
    res.status(201).json({ id: result.insertId, message: 'Download added' });
  } catch (err) {
    console.error('Download create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await db.query('DELETE FROM downloads WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
