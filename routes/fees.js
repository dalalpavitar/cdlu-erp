const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { optionalAuth, teacherAuth } = require('../middleware/auth');

router.get('/', optionalAuth, async (req, res) => {
  try {
    let { status, semester, studentId, regId } = req.query;
    // Student can only see their own fees
    if (req.user && req.user.role === 'student') {
      regId = req.user.regId;
      studentId = null;
    }
    let sql = `SELECT f.*, s.name as student_name, s.reg_id, s.phone
               FROM fees f
               JOIN students s ON f.student_id = s.id
               WHERE 1=1`;
    const params = [];
    if (status) { sql += ` AND f.status = ?`; params.push(status); }
    if (semester) { sql += ` AND f.semester = ?`; params.push(semester); }
    if (studentId) { sql += ` AND f.student_id = ?`; params.push(studentId); }
    if (regId) { sql += ` AND s.reg_id = ?`; params.push(regId); }
    sql += ` ORDER BY f.due_date DESC`;
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching fees:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', teacherAuth, async (req, res) => {
  try {
    const { studentId, semester, totalFees, paidAmount, dueDate, paymentMode } = req.body;
    if (!studentId || !semester || !totalFees) {
      return res.status(400).json({ error: 'Student, semester and total fees required' });
    }
    const amount = parseFloat(paidAmount) || 0;
    const status = amount >= parseFloat(totalFees) ? 'paid' : (amount > 0 ? 'partial' : 'unpaid');
    const [result] = await db.query(
      `INSERT INTO fees (student_id, semester, total_fees, paid_amount, due_date, paid_date, status, payment_mode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [studentId, semester, totalFees, amount, dueDate || null, amount > 0 ? new Date() : null, status, paymentMode || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Error adding fee:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', teacherAuth, async (req, res) => {
  try {
    const { paidAmount, paymentMode } = req.body;
    const [fee] = await db.query('SELECT * FROM fees WHERE id = ?', [req.params.id]);
    if (fee.length === 0) return res.status(404).json({ error: 'Fee record not found' });
    const newPaid = parseFloat(fee[0].paid_amount) + parseFloat(paidAmount || 0);
    const status = newPaid >= parseFloat(fee[0].total_fees) ? 'paid' : (newPaid > 0 ? 'partial' : 'unpaid');
    await db.query(
      'UPDATE fees SET paid_amount=?, paid_date=?, status=?, payment_mode=? WHERE id=?',
      [newPaid, new Date(), status, paymentMode || fee[0].payment_mode, req.params.id]
    );
    res.json({ success: true, status });
  } catch (err) {
    console.error('Error updating fee:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/due', teacherAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT f.*, s.name as student_name, s.reg_id, s.phone, s.program_id,
              (f.total_fees - f.paid_amount) as due_amount
       FROM fees f
       JOIN students s ON f.student_id = s.id
       WHERE f.status IN ('unpaid', 'partial')
       ORDER BY (f.total_fees - f.paid_amount) DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching due fees:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/statistics', teacherAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         COUNT(*) as total_records,
         COALESCE(SUM(total_fees), 0) as total_collectable,
         COALESCE(SUM(paid_amount), 0) as total_collected,
         COALESCE(SUM(total_fees - paid_amount), 0) as total_due,
         SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_count,
         SUM(CASE WHEN status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_count,
         SUM(CASE WHEN status = 'partial' THEN 1 ELSE 0 END) as partial_count
       FROM fees`
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching fee statistics:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
