const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'cdlu_erp'
  });

  const hash = await bcrypt.hash('teacher123', 10);

  await connection.query(`INSERT IGNORE INTO teachers (name, email, password_hash, department, qualification, phone)
    VALUES ('Dr. Test Teacher', 'teacher@cdlu.ac.in', ?, 'Computer Science', 'Ph.D.', '9999999999')`, [hash]);

  await connection.query(`INSERT IGNORE INTO students (reg_id, name, dob, program_id, semester, phone, email, address)
    VALUES ('CDLU2025001', 'Test Student', '2000-01-01', 1, 1, '8888888888', 'student@cdlu.ac.in', 'Sirsa, Haryana')`);

  await connection.query(`INSERT IGNORE INTO courses (name, code, department, credits)
    VALUES
    ('B.A. 1st Year', 'BA101', 'Arts', 40),
    ('B.Sc. 1st Year', 'SC101', 'Science', 40),
    ('M.A. Hindi 1st Sem', 'MAH101', 'Hindi', 20),
    ('M.Sc. Physics 1st Sem', 'MSP101', 'Physics', 20)`);

  console.log('Seed data inserted successfully!');
  console.log('Teacher: teacher@cdlu.ac.in / teacher123');
  console.log('Student: CDLU2025001 / 2000-01-01');
  console.log('Admin password: cdlu@2026');
  await connection.end();
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
