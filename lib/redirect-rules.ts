import { db } from '@/lib/db';
import { logDatabaseError } from '@/lib/logger';
import { normalizeInternalRedirectPath } from '@/lib/security/redirect';

type RedirectRule = { targetPath: string; statusCode: number };
let snapshot: { expiresAt: number; rules: Map<string, RedirectRule> } | null = null;
let pendingLoad: Promise<Map<string, RedirectRule>> | null = null;

async function loadRedirectRules(): Promise<Map<string, RedirectRule>> {
  if (snapshot && snapshot.expiresAt > Date.now()) return snapshot.rules;
  if (pendingLoad) return pendingLoad;
  pendingLoad = db.redirect.findMany({ select: { sourcePath: true, targetPath: true, statusCode: true } })
    .then((rows) => {
      const rules = new Map(rows.map(({ sourcePath, ...rule }) => [sourcePath, rule]));
      snapshot = { expiresAt: Date.now() + 60_000, rules };
      return rules;
    })
    .catch((error) => {
      logDatabaseError('redirect.lookup', error);
      return snapshot?.rules ?? new Map<string, RedirectRule>();
    })
    .finally(() => { pendingLoad = null; });
  return pendingLoad;
}

export function invalidateRedirectRulesCache(): void {
  snapshot = null;
}

export async function findRedirectRule(pathname: string) {
  const sourcePath = normalizeInternalRedirectPath(pathname);
  if (!sourcePath) return null;

  return (await loadRedirectRules()).get(sourcePath) ?? null;
}
