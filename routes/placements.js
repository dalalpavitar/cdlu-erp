const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT p.*, pr.name as program_name FROM placements p LEFT JOIN programs pr ON p.program_id = pr.id ORDER BY p.recruitment_date DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Placements error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const [[total]] = await db.query('SELECT COUNT(*) as total FROM placements');
    const [[avgPackage]] = await db.query('SELECT COALESCE(ROUND(AVG(package),2),0) as avg_package FROM placements WHERE package > 0');
    const [topRecruiters] = await db.query('SELECT company_name, COUNT(*) as count FROM placements GROUP BY company_name ORDER BY count DESC LIMIT 10');
    res.json({ total: total.total, avgPackage: avgPackage.avg_package, topRecruiters });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', adminOnly, async (req, res) => {
  try {
    const { company_name, student_name, program_id, package: pkg, placement_year, recruitment_date } = req.body;
    const [result] = await db.query(
      'INSERT INTO placements (company_name, student_name, program_id, package, placement_year, recruitment_date) VALUES (?, ?, ?, ?, ?, ?)',
      [company_name, student_name, program_id, pkg, placement_year, recruitment_date]
    );
    res.status(201).json({ id: result.insertId, message: 'Placement record added' });
  } catch (err) {
    console.error('Placement create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
