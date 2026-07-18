const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { adminOnly } = require('../middleware/auth');

router.post('/login', async (req, res) => {
  try {
    const { email, password, regId, reg_id, dob, role } = req.body;
    if (role === 'admin') {
      if (password === 'cdlu@2026') {
        const token = jwt.sign({ role: 'admin', id: 0 }, process.env.JWT_SECRET || 'cdlu-erp-secret-key-2026', { expiresIn: '24h' });
        return res.json({ success: true, token, user: { role: 'admin', id: 0, name: 'Admin' } });
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
      const studentRegId = regId || reg_id;
      const studentDob = password || dob;
      const [rows] = await db.query('SELECT * FROM students WHERE reg_id = ?', [studentRegId]);
      if (rows.length === 0) return res.status(401).json({ error: 'Student not found' });
      const dbDob = rows[0].dob ? new Date(rows[0].dob).toISOString().slice(0, 10) : '';
      const inputDob = studentDob ? new Date(studentDob).toISOString().slice(0, 10) : '';
      if (dbDob !== inputDob) return res.status(401).json({ error: 'Invalid DOB' });
      const token = jwt.sign({ role: 'student', id: rows[0].id, name: rows[0].name, regId: rows[0].reg_id, semester: rows[0].semester }, process.env.JWT_SECRET || 'cdlu-erp-secret-key-2026', { expiresIn: '24h' });
      return res.json({ success: true, token, user: { role: 'student', id: rows[0].id, name: rows[0].name, regId: rows[0].reg_id, semester: rows[0].semester } });
    }
    return res.status(400).json({ error: 'Invalid role' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/migrate', adminOnly, async (req, res) => {
  try {
    const tables = [
      `CREATE TABLE IF NOT EXISTS visitors (id INT PRIMARY KEY AUTO_INCREMENT, ip_address VARCHAR(45), visit_date DATE NOT NULL, visit_count INT DEFAULT 1, UNIQUE KEY unique_visit (ip_address, visit_date)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS page_content (id INT PRIMARY KEY AUTO_INCREMENT, page_key VARCHAR(100) UNIQUE NOT NULL, title VARCHAR(255), content TEXT, image_url VARCHAR(500), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS gallery (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(255) NOT NULL, description TEXT, media_url VARCHAR(500) NOT NULL, media_type ENUM('image','video') DEFAULT 'image', category VARCHAR(100), uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS downloads (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(255) NOT NULL, description TEXT, file_url VARCHAR(500) NOT NULL, category VARCHAR(100), file_size VARCHAR(20), uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS feedback (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) NOT NULL, email VARCHAR(100), phone VARCHAR(10), type ENUM('student','parent','visitor') DEFAULT 'visitor', subject VARCHAR(255), message TEXT NOT NULL, rating INT DEFAULT 5, submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS placements (id INT PRIMARY KEY AUTO_INCREMENT, company_name VARCHAR(200) NOT NULL, student_name VARCHAR(100), program_id INT, package DECIMAL(10,2), placement_year YEAR, recruitment_date DATE, FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS events (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(255) NOT NULL, description TEXT, event_date DATE NOT NULL, event_time TIME, location VARCHAR(200), category VARCHAR(100), is_featured BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS news (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(255) NOT NULL, summary TEXT, content TEXT, image_url VARCHAR(500), category VARCHAR(100), is_published BOOLEAN DEFAULT TRUE, published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS tenders (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(255) NOT NULL, description TEXT, document_url VARCHAR(500), publish_date DATE, due_date DATE, status ENUM('open','closed','awarded') DEFAULT 'open', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS faculty (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) NOT NULL, designation VARCHAR(100), department_id INT, qualification TEXT, specialization TEXT, email VARCHAR(100), phone VARCHAR(10), photo_url VARCHAR(500), join_date DATE, FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS scholarships (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(200) NOT NULL, description TEXT, amount DECIMAL(10,2), eligibility TEXT, application_deadline DATE, category VARCHAR(100)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `ALTER TABLE results MODIFY COLUMN exam_type ENUM('theory','practical') NOT NULL`,
      `ALTER TABLE students ADD COLUMN mother_name VARCHAR(100) DEFAULT NULL AFTER father_name`,
      `ALTER TABLE students ADD COLUMN qualification VARCHAR(50) DEFAULT NULL AFTER category`,
      `ALTER TABLE students ADD COLUMN percentage VARCHAR(20) DEFAULT NULL AFTER qualification`
    ];
    const created = [];
    for (const sql of tables) {
      try { await db.query(sql); created.push('OK'); } catch (e) { created.push(e.message); }
    }
    res.json({ message: 'Migration complete', results: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/seed', adminOnly, async (req, res) => {
  try {
    const hash = await bcrypt.hash('teacher123', 10);
    await db.query(`INSERT IGNORE INTO programs (id, name, code, type, duration_years) VALUES
      (1, 'Bachelor of Arts', 'BA', 'UG', 3),
      (2, 'Bachelor of Science', 'BSc', 'UG', 3),
      (3, 'Master of Arts', 'MA', 'PG', 2),
      (4, 'Master of Science', 'MSc', 'PG', 2)`);
    await db.query(`INSERT IGNORE INTO departments (id, name, code, faculty) VALUES
      (1, 'Computer Science', 'CS', 'Science'),
      (2, 'Arts', 'ARTS', 'Arts & Humanities'),
      (3, 'Science', 'SCI', 'Science'),
      (4, 'Hindi', 'HIN', 'Arts & Humanities'),
      (5, 'Physics', 'PHY', 'Science')`);
    await db.query(`INSERT IGNORE INTO teachers (name, email, password_hash, department_id, qualification, phone)
      VALUES ('Dr. Test Teacher', 'teacher@cdlu.ac.in', ?, 1, 'Ph.D.', '9999999999')`, [hash]);
    await db.query(`INSERT IGNORE INTO students (reg_id, name, father_name, dob, gender, category, phone, email, address, program_id, semester, admission_year)
      VALUES ('CDLU2025001', 'Test Student', 'Mr. Test Father', '2000-01-01', 'Male', 'General', '8888888888', 'student@cdlu.ac.in', 'Sirsa, Haryana', 1, 1, 2025),
             ('CDLU2025002', 'Test Student 2', 'Mr. Test Father 2', '2001-06-15', 'Female', 'SC', '8888888889', 'student2@cdlu.ac.in', 'Sirsa, Haryana', 2, 1, 2025)`);
    await db.query(`INSERT IGNORE INTO courses (name, code, program_id, department_id, semester, credits) VALUES
      ('B.A. 1st Year', 'BA101', 1, 2, 1, 40),
      ('B.Sc. 1st Year', 'SC101', 2, 3, 1, 40),
      ('M.A. Hindi 1st Sem', 'MAH101', 3, 4, 1, 20),
      ('M.Sc. Physics 1st Sem', 'MSP101', 4, 5, 1, 20)`);
    res.json({ success: true, message: 'Seed data created', teacher: 'teacher@cdlu.ac.in / teacher123', student: 'CDLU2025001 / 2000-01-01' });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/register/teacher', adminOnly, async (req, res) => {
  try {
    const { name, email, password, department_id, qualification, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, password required' });
    const [existing] = await db.query('SELECT id FROM teachers WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ error: 'Teacher with this email already exists' });
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO teachers (name, email, password_hash, department_id, qualification, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hash, department_id || null, qualification || null, phone || null]
    );
    res.json({ success: true, message: 'Teacher registered successfully', id: result.insertId });
  } catch (err) {
    console.error('Teacher register error:', err);
    res.status(500).json({ error: err.message });
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
