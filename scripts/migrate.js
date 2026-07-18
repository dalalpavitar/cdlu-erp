const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT) || 3306,
    multipleStatements: true
  });

  const dbName = process.env.DB_NAME || 'cdlu_erp';
  await connection.query(\CREATE DATABASE IF NOT EXISTS \\\\\\\\);
  await connection.query(\USE \\\\\\\\);

  const tables = [
    \CREATE TABLE IF NOT EXISTS visitors (
      id INT PRIMARY KEY AUTO_INCREMENT,
      ip_address VARCHAR(45),
      visit_date DATE NOT NULL,
      visit_count INT DEFAULT 1,
      UNIQUE KEY unique_visit (ip_address, visit_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4\,
  ];

  for (const sql of tables) {
    try { await connection.query(sql); console.log('OK'); }
    catch (err) { console.error('Error:', err.message); }
  }
  console.log('Migration complete!');
  await connection.end();
}
migrate().catch(err => { console.error('Failed:', err); process.exit(1); });
