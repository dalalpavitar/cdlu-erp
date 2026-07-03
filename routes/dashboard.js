const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/stats', async (req, res) => {
  try {
    const [[studentCount]] = await db.query('SELECT COUNT(*) as count FROM students');
    const [[teacherCount]] = await db.query('SELECT COUNT(*) as count FROM teachers');
    const [[courseCount]] = await db.query('SELECT COUNT(*) as count FROM courses');
    const [[feeStats]] = await db.query('SELECT COALESCE(SUM(paid_amount),0) as collected, COALESCE(SUM(total_fees - paid_amount),0) as due FROM fees');
    const [[todayAtt]] = await db.query(
      "SELECT COUNT(*) as count FROM attendance WHERE date = CURDATE()"
    );
    const [[programCount]] = await db.query('SELECT COUNT(*) as count FROM programs');
    const [recentStudents] = await db.query(
      'SELECT id, name, reg_id, created_at FROM students ORDER BY created_at DESC LIMIT 5'
    );
    const [recentNotices] = await db.query(
      'SELECT n.title, n.created_at, t.name as posted_by FROM notices n LEFT JOIN teachers t ON n.posted_by = t.id ORDER BY n.created_at DESC LIMIT 5'
    );
    res.json({
      students: studentCount.count,
      teachers: teacherCount.count,
      courses: courseCount.count,
      programs: programCount.count,
      feesCollected: feeStats.collected,
      feesDue: feeStats.due,
      todayAttendance: todayAtt.count,
      recentStudents,
      recentNotices
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/programs', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM programs ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching programs:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/departments', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM departments ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
