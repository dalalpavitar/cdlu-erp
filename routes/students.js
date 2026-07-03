const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const { search, program, semester, status } = req.query;
    let sql = `SELECT s.*, p.name as program_name FROM students s LEFT JOIN programs p ON s.program_id = p.id WHERE 1=1`;
    const params = [];
    if (search) { sql += ` AND (s.name LIKE ? OR s.phone LIKE ? OR s.reg_id LIKE ?)`; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (program) { sql += ` AND s.program_id = ?`; params.push(program); }
    if (semester) { sql += ` AND s.semester = ?`; params.push(semester); }
    if (status) { sql += ` AND s.status = ?`; params.push(status); }
    sql += ` ORDER BY s.created_at DESC`;
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.*, p.name as program_name, d.name as department_name
       FROM students s
       LEFT JOIN programs p ON s.program_id = p.id
       LEFT JOIN departments d ON d.id = p.id
       WHERE s.id = ?`, [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, fatherName, dob, gender, category, phone, email, address, programId, qualification, percentage } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });
    const regId = 'CDLU-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    const [result] = await db.query(
      `INSERT INTO students (reg_id, name, father_name, dob, gender, category, phone, email, address, program_id, semester, admission_year)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, YEAR(CURDATE()))`,
      [regId, name, fatherName || null, dob || null, gender || null, category || null, phone, email || null, address || null, programId || null]
    );
    res.json({ success: true, id: result.insertId, reg_id: regId });
  } catch (err) {
    console.error('Error creating student:', err);
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Phone number already registered' });
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, fatherName, dob, gender, category, phone, email, address, programId, semester, status } = req.body;
    await db.query(
      `UPDATE students SET name=?, father_name=?, dob=?, gender=?, category=?, phone=?, email=?, address=?, program_id=?, semester=?, status=?
       WHERE id=?`,
      [name, fatherName, dob, gender, category, phone, email, address, programId, semester, status, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id/attendance', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, c.name as course_name FROM attendance a
       JOIN courses c ON a.course_id = c.id
       WHERE a.student_id = ?
       ORDER BY a.date DESC`, [req.params.id]
    );
    const [stats] = await db.query(
      `SELECT COUNT(*) as total,
              SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) as present,
              ROUND(SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as percentage
       FROM attendance WHERE student_id = ?`, [req.params.id]
    );
    res.json({ records: rows, stats: stats[0] });
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id/fees', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM fees WHERE student_id = ? ORDER BY semester DESC`, [req.params.id]
    );
    const [total] = await db.query(
      `SELECT COALESCE(SUM(total_fees),0) as total, COALESCE(SUM(paid_amount),0) as paid,
              COALESCE(SUM(total_fees - paid_amount),0) as due
       FROM fees WHERE student_id = ?`, [req.params.id]
    );
    res.json({ records: rows, summary: total[0] });
  } catch (err) {
    console.error('Error fetching fees:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id/results', async (req, res) => {
  try {
    const { semester } = req.query;
    let sql = `SELECT r.*, c.name as course_name, c.code as course_code FROM results r
               JOIN courses c ON r.course_id = c.id
               WHERE r.student_id = ?`;
    const params = [req.params.id];
    if (semester) { sql += ` AND r.semester = ?`; params.push(semester); }
    sql += ` ORDER BY r.semester, c.code`;
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching results:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id/courses', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, p.name as program_name FROM courses c
       JOIN registrations r ON c.id = r.course_id
       LEFT JOIN programs p ON c.program_id = p.id
       WHERE r.student_id = ?`, [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
