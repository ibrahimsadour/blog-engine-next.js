export function logDatabaseError(context: string, error: unknown): void {
  console.error(`[database:${context}]`, error instanceof Error ? error.message : error);
}
