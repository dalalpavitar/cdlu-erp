const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { teacherAuth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { programId, semester, teacherId } = req.query;
    let sql = `SELECT c.*, p.name as program_name, d.name as department_name, t.name as teacher_name
               FROM courses c
               LEFT JOIN programs p ON c.program_id = p.id
               LEFT JOIN departments d ON c.department_id = d.id
               LEFT JOIN teachers t ON c.teacher_id = t.id
               WHERE 1=1`;
    const params = [];
    if (programId) { sql += ` AND c.program_id = ?`; params.push(programId); }
    if (semester) { sql += ` AND c.semester = ?`; params.push(semester); }
    if (teacherId) { sql += ` AND c.teacher_id = ?`; params.push(teacherId); }
    sql += ` ORDER BY p.name, c.semester, c.code`;
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, p.name as program_name, t.name as teacher_name
       FROM courses c
       LEFT JOIN programs p ON c.program_id = p.id
       LEFT JOIN teachers t ON c.teacher_id = t.id
       WHERE c.id = ?`, [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Course not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching course:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', teacherAuth, async (req, res) => {
  try {
    const { name, code, programId, departmentId, semester, credits, teacherId, fees } = req.body;
    if (!name || !code) return res.status(400).json({ error: 'Name and code required' });
    const [result] = await db.query(
      `INSERT INTO courses (name, code, program_id, department_id, semester, credits, teacher_id, fees)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, code, programId || null, departmentId || null, semester || null, credits || null, teacherId || null, fees || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Error creating course:', err);
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Course code already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', teacherAuth, async (req, res) => {
  try {
    const { name, code, programId, departmentId, semester, credits, teacherId, fees } = req.body;
    await db.query(
      `UPDATE courses SET name=?, code=?, program_id=?, department_id=?, semester=?, credits=?, teacher_id=?, fees=?
       WHERE id=?`,
      [name, code, programId, departmentId, semester, credits, teacherId, fees, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', teacherAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM courses WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
