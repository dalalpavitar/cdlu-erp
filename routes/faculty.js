const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT f.*, d.name as department_name FROM faculty f LEFT JOIN departments d ON f.department_id = d.id ORDER BY f.name'
    );
    res.json(rows);
  } catch (err) {
    console.error('Faculty error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/department/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT f.*, d.name as department_name FROM faculty f LEFT JOIN departments d ON f.department_id = d.id WHERE f.department_id = ? ORDER BY f.name',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', adminOnly, async (req, res) => {
  try {
    const { name, designation, department_id, qualification, specialization, email, phone, photo_url, join_date } = req.body;
    const [result] = await db.query(
      'INSERT INTO faculty (name, designation, department_id, qualification, specialization, email, phone, photo_url, join_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, designation, department_id, qualification, specialization, email, phone, photo_url, join_date]
    );
    res.status(201).json({ id: result.insertId, message: 'Faculty added' });
  } catch (err) {
    console.error('Faculty create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
