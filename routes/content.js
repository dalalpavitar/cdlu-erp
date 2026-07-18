const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { adminOnly } = require('../middleware/auth');

router.get('/:key', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM page_content WHERE page_key = ?', [req.params.key]);
    if (rows.length === 0) return res.status(404).json({ error: 'Content not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Content error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:key', adminOnly, async (req, res) => {
  try {
    const { title, content, image_url } = req.body;
    await db.query(
      'INSERT INTO page_content (page_key, title, content, image_url) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title), content = VALUES(content), image_url = VALUES(image_url)',
      [req.params.key, title, content, image_url]
    );
    res.json({ message: 'Content updated' });
  } catch (err) {
    console.error('Content update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
