import mysql from 'mysql2/promise';

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to count database rows.');
}

const connection = await mysql.createConnection(databaseUrl);
const tables = ['Author', 'Category', 'Article', 'Redirect', 'LoginRateLimit'];
const counts = {};

try {
  for (const table of tables) {
    const [rows] = await connection.query(`SELECT COUNT(*) AS count FROM \`${table}\``);
    counts[table] = Number(rows[0].count);
  }
} finally {
  await connection.end();
}

process.stdout.write(`${JSON.stringify(counts, null, 2)}\n`);
