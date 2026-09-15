import mysql from 'mysql2/promise';

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to verify the migrated database.');
}

const expectedTables = [
  'Article',
  'Author',
  'Car',
  'CarServiceContent',
  'Category',
  'City',
  'CityServiceContent',
  'GlobalCarServiceTemplate',
  'GlobalServiceTemplate',
  'LoginRateLimit',
  'Page',
  'Redirect',
  'Service',
  'Setting',
];

const expectedColumns = {
  Article: ['noFollow', 'noIndex'],
  Category: ['showInHeader'],
  Page: ['noFollow', 'noIndex', 'showInFooter', 'showInHeader'],
  Redirect: ['sourcePath', 'statusCode', 'targetPath', 'updatedAt'],
};

const forbiddenRedirectColumns = ['destination', 'permanent', 'source'];
const connection = await mysql.createConnection(databaseUrl);

try {
  const [tableRows] = await connection.query(
    'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()'
  );
  const tables = new Set(tableRows.map((row) => row.TABLE_NAME));

  for (const table of expectedTables) {
    if (!tables.has(table)) throw new Error(`Missing table after migration: ${table}`);
  }

  for (const [table, columns] of Object.entries(expectedColumns)) {
    const [columnRows] = await connection.execute(
      'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
      [table]
    );
    const existingColumns = new Set(columnRows.map((row) => row.COLUMN_NAME));

    for (const column of columns) {
      if (!existingColumns.has(column)) {
        throw new Error(`Missing column after migration: ${table}.${column}`);
      }
    }

    if (table === 'Redirect') {
      for (const column of forbiddenRedirectColumns) {
        if (existingColumns.has(column)) {
          throw new Error(`Legacy Redirect column still exists: ${column}`);
        }
      }
    }
  }

  if (process.env.EXPECT_LEGACY_FIXTURE === '1') {
    const [redirects] = await connection.query(
      'SELECT `sourcePath`, `targetPath`, `statusCode` FROM `Redirect` ORDER BY `sourcePath`'
    );
    const serialized = JSON.stringify(redirects);

    if (
      !serialized.includes('/legacy-permanent') ||
      !serialized.includes('/legacy-temporary') ||
      !redirects.some((row) => row.statusCode === 301) ||
      !redirects.some((row) => row.statusCode === 302)
    ) {
      throw new Error('Legacy Redirect data was not preserved correctly.');
    }
  }
} finally {
  await connection.end();
}

console.log('Database schema and preserved data are valid.');
