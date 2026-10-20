/** A draft button must override the selected publish status without relying on a state update race. */
export function resolveArticlePublicationIntent(isPublished: boolean, intent?: string): boolean {
  if (intent === 'draft') return false;
  if (intent === 'publish') return true;
  return isPublished;
}
