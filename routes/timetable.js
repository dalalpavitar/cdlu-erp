const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const { day, semester, courseId, teacherId } = req.query;
    let sql = `SELECT t.*, c.name as course_name, c.code as course_code,
                      t2.name as teacher_name
               FROM timetable t
               JOIN courses c ON t.course_id = c.id
               LEFT JOIN teachers t2 ON t.teacher_id = t2.id
               WHERE 1=1`;
    const params = [];
    if (day) { sql += ` AND t.day = ?`; params.push(day); }
    if (semester) { sql += ` AND t.semester = ?`; params.push(semester); }
    if (courseId) { sql += ` AND t.course_id = ?`; params.push(courseId); }
    if (teacherId) { sql += ` AND t.teacher_id = ?`; params.push(teacherId); }
    sql += ` ORDER BY FIELD(t.day, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'), t.start_time`;
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching timetable:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { courseId, teacherId, day, startTime, endTime, room, semester } = req.body;
    if (!courseId || !day || !startTime || !endTime) {
      return res.status(400).json({ error: 'Course, day, start and end time required' });
    }
    const [result] = await db.query(
      'INSERT INTO timetable (course_id, teacher_id, day, start_time, end_time, room, semester) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [courseId, teacherId || null, day, startTime, endTime, room || null, semester || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Error adding timetable entry:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM timetable WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting timetable entry:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
