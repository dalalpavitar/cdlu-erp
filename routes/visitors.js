const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/count', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT COALESCE(SUM(visit_count),0) as total FROM visitors');
    res.json({ count: rows[0].total });
  } catch (err) {
    console.error('Visitor count error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/track', async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || '0.0.0.0';
    const today = new Date().toISOString().slice(0, 10);
    await db.query(
      'INSERT INTO visitors (ip_address, visit_date, visit_count) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE visit_count = visit_count + 1',
      [ip, today]
    );
    const [rows] = await db.query('SELECT COALESCE(SUM(visit_count),0) as total FROM visitors');
    res.json({ count: rows[0].total });
  } catch (err) {
    console.error('Visitor track error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
