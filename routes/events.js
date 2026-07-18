const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM events ORDER BY event_date ASC LIMIT 50');
    res.json(rows);
  } catch (err) {
    console.error('Events error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM events WHERE is_featured = TRUE ORDER BY event_date ASC LIMIT 6');
    res.json(rows);
  } catch (err) {
    console.error('Featured events error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', adminOnly, async (req, res) => {
  try {
    const { title, description, event_date, event_time, location, category, is_featured } = req.body;
    const [result] = await db.query(
      'INSERT INTO events (title, description, event_date, event_time, location, category, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, event_date, event_time || null, location, category, is_featured || false]
    );
    res.status(201).json({ id: result.insertId, message: 'Event created' });
  } catch (err) {
    console.error('Event create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await db.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
