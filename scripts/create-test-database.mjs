import mysql from 'mysql2/promise';

const adminDatabaseUrl = process.env.ADMIN_DATABASE_URL?.trim();
const testDatabaseName = process.env.TEST_DATABASE_NAME?.trim();

if (!adminDatabaseUrl) {
  throw new Error('ADMIN_DATABASE_URL is required to create the test database.');
}

if (!testDatabaseName || !/^[a-z0-9_]+_test$/.test(testDatabaseName)) {
  throw new Error('TEST_DATABASE_NAME must be a safe name ending in _test.');
}

const connection = await mysql.createConnection(adminDatabaseUrl);

try {
  await connection.query(
    `CREATE DATABASE \`${testDatabaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
} finally {
  await connection.end();
}

console.log(`Created isolated database: ${testDatabaseName}`);
