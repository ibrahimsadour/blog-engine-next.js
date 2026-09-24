export interface ContentHeading {
  id: string;
  text: string;
  level: number;
}

/** Adds anchors to the sanitized HTML actually rendered on a dynamic service page. */
export function prepareDynamicContent(html: string): { html: string; headings: ContentHeading[] } {
  const headings: ContentHeading[] = [];
  const usedIds = new Set<string>();
  const result = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (original, level, attrs, inner) => {
    const text = inner.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (!text) return original;

    const existingId = attrs.match(/\sid=["']([^"']+)["']/i)?.[1];
    const base = existingId || `dynamic-heading-${headings.length + 1}`;
    let id = base;
    let suffix = 2;
    while (usedIds.has(id)) id = `${base}-${suffix++}`;
    usedIds.add(id);
    headings.push({ id, text, level: Number(level) });

    const cleanAttrs = attrs.replace(/\sid=["'][^"']*["']/i, '');
    return `<h${level}${cleanAttrs} id="${id}">${inner}</h${level}>`;
  });

  return { html: result, headings };
}
