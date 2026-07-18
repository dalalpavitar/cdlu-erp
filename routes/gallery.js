const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM gallery ORDER BY uploaded_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Gallery error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/category/:cat', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM gallery WHERE category = ? ORDER BY uploaded_at DESC', [req.params.cat]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', adminOnly, async (req, res) => {
  try {
    const { title, description, media_url, media_type, category } = req.body;
    const [result] = await db.query(
      'INSERT INTO gallery (title, description, media_url, media_type, category) VALUES (?, ?, ?, ?, ?)',
      [title, description, media_url, media_type || 'image', category]
    );
    res.status(201).json({ id: result.insertId, message: 'Media added' });
  } catch (err) {
    console.error('Gallery create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await db.query('DELETE FROM gallery WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
