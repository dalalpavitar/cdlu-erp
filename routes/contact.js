const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, type, subject, message, rating } = req.body;
    const [result] = await db.query(
      'INSERT INTO feedback (name, email, phone, type, subject, message, rating) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone, type || 'visitor', subject, message, rating || 5]
    );
    res.status(201).json({ id: result.insertId, message: 'Thank you for your feedback!' });
  } catch (err) {
    console.error('Feedback error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM feedback ORDER BY submitted_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
