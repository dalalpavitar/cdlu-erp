const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { adminAuth } = require('../middleware/auth');

router.post('/login', async (req, res) => {
  try {
    const { email, password, regId, role } = req.body;
    if (role === 'admin') {
      if (password === 'cdlu@2026') {
        const token = jwt.sign({ role: 'admin', id: 0 }, process.env.JWT_SECRET || 'cdlu-erp-secret-key-2026', { expiresIn: '24h' });
        return res.json({ success: true, token, user: { role: 'admin', name: 'Admin' } });
      }
      return res.status(401).json({ error: 'Invalid admin password' });
    }
    if (role === 'teacher') {
      const [rows] = await db.query('SELECT * FROM teachers WHERE email = ?', [email]);
      if (rows.length === 0) return res.status(401).json({ error: 'Teacher not found' });
      const match = await bcrypt.compare(password, rows[0].password_hash);
      if (!match) return res.status(401).json({ error: 'Invalid password' });
      const token = jwt.sign({ role: 'teacher', id: rows[0].id, name: rows[0].name }, process.env.JWT_SECRET || 'cdlu-erp-secret-key-2026', { expiresIn: '24h' });
      return res.json({ success: true, token, user: { role: 'teacher', id: rows[0].id, name: rows[0].name, email: rows[0].email } });
    }
    if (role === 'student') {
      const [rows] = await db.query('SELECT * FROM students WHERE reg_id = ?', [regId]);
      if (rows.length === 0) return res.status(401).json({ error: 'Student not found' });
      const dobMatch = rows[0].dob ? new Date(rows[0].dob).toISOString().slice(0, 10) === password : false;
      if (!dobMatch) return res.status(401).json({ error: 'Invalid DOB' });
      const token = jwt.sign({ role: 'student', id: rows[0].id, name: rows[0].name, regId: rows[0].reg_id }, process.env.JWT_SECRET || 'cdlu-erp-secret-key-2026', { expiresIn: '24h' });
      return res.json({ success: true, token, user: { role: 'student', id: rows[0].id, name: rows[0].name, regId: rows[0].reg_id } });
    }
    return res.status(400).json({ error: 'Invalid role' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    if (auth === 'cdlu@2026') return res.json({ role: 'admin', name: 'Admin' });
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cdlu-erp-secret-key-2026');
    res.json(decoded);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
