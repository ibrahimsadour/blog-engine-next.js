export function requireDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is required. Set a valid MySQL connection URL before starting the application or deploying migrations.'
    );
  }

  return databaseUrl;
}
