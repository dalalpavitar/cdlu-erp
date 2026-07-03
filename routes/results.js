const express = require('express');
const router = express.Router();
const db = require('../config/db');

function calculateGrade(marks, maxMarks) {
  const pct = (marks / maxMarks) * 100;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 40) return 'D';
  return 'F';
}

router.get('/', async (req, res) => {
  try {
    const { courseId, semester, studentId } = req.query;
    let sql = `SELECT r.*, s.name as student_name, s.reg_id, c.name as course_name, c.code as course_code
               FROM results r
               JOIN students s ON r.student_id = s.id
               JOIN courses c ON r.course_id = c.id
               WHERE 1=1`;
    const params = [];
    if (courseId) { sql += ` AND r.course_id = ?`; params.push(courseId); }
    if (semester) { sql += ` AND r.semester = ?`; params.push(semester); }
    if (studentId) { sql += ` AND r.student_id = ?`; params.push(studentId); }
    sql += ` ORDER BY r.semester, c.code, s.name`;
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching results:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { studentId, courseId, semester, examType, marksObtained, maxMarks, enteredBy } = req.body;
    if (!studentId || !courseId || !examType || marksObtained === undefined) {
      return res.status(400).json({ error: 'Student, course, exam type and marks required' });
    }
    const maxM = parseFloat(maxMarks) || 100;
    const marks = parseFloat(marksObtained);
    const grade = calculateGrade(marks, maxM);
    const [existing] = await db.query(
      'SELECT id FROM results WHERE student_id=? AND course_id=? AND semester=? AND exam_type=?',
      [studentId, courseId, semester || 1, examType]
    );
    if (existing.length > 0) {
      await db.query(
        'UPDATE results SET marks_obtained=?, max_marks=?, grade=?, entered_by=? WHERE id=?',
        [marks, maxM, grade, enteredBy || null, existing[0].id]
      );
      return res.json({ success: true, id: existing[0].id, grade, updated: true });
    }
    const [result] = await db.query(
      `INSERT INTO results (student_id, course_id, semester, exam_type, marks_obtained, max_marks, grade, entered_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [studentId, courseId, semester || 1, examType, marks, maxM, grade, enteredBy || null]
    );
    res.json({ success: true, id: result.insertId, grade });
  } catch (err) {
    console.error('Error adding result:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/student/:studentId', async (req, res) => {
  try {
    const { semester } = req.query;
    let sql = `SELECT r.*, c.name as course_name, c.code as course_code, c.credits
               FROM results r
               JOIN courses c ON r.course_id = c.id
               WHERE r.student_id = ?`;
    const params = [req.params.studentId];
    if (semester) { sql += ` AND r.semester = ?`; params.push(semester); }
    sql += ` ORDER BY r.semester, c.code`;
    const [rows] = await db.query(sql, params);
    const semesters = [...new Set(rows.map(r => r.semester))];
    const result = {};
    semesters.forEach(sem => {
      const semResults = rows.filter(r => r.semester === sem);
      const totalMarks = semResults.reduce((sum, r) => sum + parseFloat(r.marks_obtained), 0);
      const totalMax = semResults.reduce((sum, r) => sum + parseFloat(r.max_marks), 0);
      result[`Semester ${sem}`] = {
        subjects: semResults,
        total: totalMarks,
        maxTotal: totalMax,
        percentage: totalMax > 0 ? ((totalMarks / totalMax) * 100).toFixed(1) : 0
      };
    });
    res.json(result);
  } catch (err) {
    console.error('Error fetching student results:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
