const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT t.id, t.name, t.email, t.phone, t.department_id, t.qualification, t.join_date,
              d.name as department_name
       FROM teachers t
       LEFT JOIN departments d ON t.department_id = d.id
       ORDER BY t.name`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching teachers:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT t.*, d.name as department_name
       FROM teachers t LEFT JOIN departments d ON t.department_id = d.id
       WHERE t.id = ?`, [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Teacher not found' });
    const [courses] = await db.query('SELECT id, name, code FROM courses WHERE teacher_id = ?', [req.params.id]);
    rows[0].courses = courses;
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching teacher:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', adminOnly, async (req, res) => {
  try {
    const { name, email, phone, departmentId, qualification, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO teachers (name, email, phone, department_id, qualification, password_hash, join_date) VALUES (?, ?, ?, ?, ?, ?, CURDATE())',
      [name, email, phone || null, departmentId || null, qualification || null, passwordHash]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Error creating teacher:', err);
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', adminOnly, async (req, res) => {
  try {
    const { name, email, phone, departmentId, qualification } = req.body;
    await db.query(
      'UPDATE teachers SET name=?, email=?, phone=?, department_id=?, qualification=? WHERE id=?',
      [name, email, phone, departmentId, qualification, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating teacher:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await db.query('DELETE FROM teachers WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting teacher:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
