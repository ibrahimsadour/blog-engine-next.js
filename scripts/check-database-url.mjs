const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  console.error(
    'DATABASE_URL is required. Set a valid MySQL connection URL before deploying migrations.'
  );
  process.exit(1);
}

try {
  const parsed = new URL(databaseUrl);
  if (parsed.protocol !== 'mysql:' || !parsed.hostname || !parsed.pathname.slice(1)) {
    throw new Error('invalid MySQL URL');
  }
} catch {
  console.error(
    'DATABASE_URL is invalid. Expected: mysql://USER:PASSWORD@HOST:PORT/DATABASE'
  );
  process.exit(1);
}

console.log('DATABASE_URL is configured.');
