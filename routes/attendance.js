const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { optionalAuth, teacherAuth } = require('../middleware/auth');

router.get('/', optionalAuth, async (req, res) => {
  try {
    let { courseId, date, semester, studentId } = req.query;
    // Student can only see their own attendance
    if (req.user && req.user.role === 'student') {
      studentId = req.user.id;
    }
    let sql = `SELECT a.*, s.name as student_name, s.reg_id, c.name as course_name
               FROM attendance a
               JOIN students s ON a.student_id = s.id
               JOIN courses c ON a.course_id = c.id
               WHERE 1=1`;
    const params = [];
    if (courseId) { sql += ` AND a.course_id = ?`; params.push(courseId); }
    if (date) { sql += ` AND a.date = ?`; params.push(date); }
    if (semester) { sql += ` AND a.semester = ?`; params.push(semester); }
    if (studentId) { sql += ` AND a.student_id = ?`; params.push(studentId); }
    sql += ` ORDER BY a.date DESC, s.name`;
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/batch', teacherAuth, async (req, res) => {
  try {
    const { records } = req.body;
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'Records array required' });
    }
    let inserted = 0, skipped = 0;
    for (const r of records) {
      if (!r.student_id || !r.course_id || !r.date || !r.status) continue;
      try {
        await db.query(
          `INSERT INTO attendance (student_id, course_id, date, status, marked_by, semester)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status=VALUES(status), marked_by=VALUES(marked_by)`,
          [r.student_id, r.course_id, r.date, r.status, r.marked_by || null, r.semester || 1]
        );
        inserted++;
      } catch (e) {
        skipped++;
      }
    }
    res.json({ success: true, inserted, skipped });
  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/report', teacherAuth, async (req, res) => {
  try {
    const { courseId, semester } = req.query;
    let sql = `SELECT s.id as student_id, s.name as student_name, s.reg_id,
                      COUNT(a.id) as total_classes,
                      SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END) as present,
                      ROUND(SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(a.id), 0), 1) as percentage
               FROM students s
               JOIN attendance a ON s.id = a.student_id
               WHERE 1=1`;
    const params = [];
    if (courseId) { sql += ` AND a.course_id = ?`; params.push(courseId); }
    if (semester) { sql += ` AND a.semester = ?`; params.push(semester); }
    sql += ` GROUP BY s.id, s.name, s.reg_id ORDER BY percentage DESC`;
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
