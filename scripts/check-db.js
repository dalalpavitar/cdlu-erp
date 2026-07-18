const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.MYSQLHOST || process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQLPORT || process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQLUSER || process.env.MYSQL_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || process.env.MYSQL_ROOT_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'railway',
  });

  const [databases] = await conn.query('SHOW DATABASES');
  console.log('Databases:', databases.map(r => Object.values(r)[0]).join(', '));

  const [tables] = await conn.query(
    "SELECT TABLE_NAME, TABLE_SCHEMA FROM information_schema.TABLES WHERE TABLE_SCHEMA IN ('railway', 'cdlu_erp')"
  );
  console.log('Tables:', tables.length ? tables.map(r => r.TABLE_SCHEMA + '.' + r.TABLE_NAME).join(', ') : '(none)');

  await conn.end();
}

run().catch(console.error);
