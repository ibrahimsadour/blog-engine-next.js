import sanitizeHtmlLibrary, { type IOptions } from 'sanitize-html';

const CONTENT_OPTIONS: IOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
    'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'figure', 'figcaption', 'table', 'thead',
    'tbody', 'tfoot', 'tr', 'th', 'td', 'hr', 'pre', 'code', 'span', 'div', 'mark', 'sup', 'sub',
  ],
  allowedAttributes: {
    '*': ['class', 'dir'],
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    h1: ['id', 'style'], h2: ['id', 'style'], h3: ['id', 'style'], h4: ['id', 'style'],
    h5: ['id', 'style'], h6: ['id', 'style'], p: ['style'], span: ['style'], mark: ['style'],
    th: ['colspan', 'rowspan', 'scope'], td: ['colspan', 'rowspan'],
  },
  allowedStyles: {
    '*': {
      'text-align': [/^(left|right|center|justify)$/],
      'background-color': [/^#[0-9a-f]{3,8}$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i],
    },
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['https'] },
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  enforceHtmlBoundary: true,
  transformTags: {
    a: (_tagName, attribs) => {
      const safeAttribs = { ...attribs };
      const rawTarget = safeAttribs.target;
      delete safeAttribs.target;
      delete safeAttribs.rel;
      const target = rawTarget === '_blank' ? '_blank' : undefined;
      return {
        tagName: 'a',
        attribs: {
          ...safeAttribs,
          ...(target ? { target, rel: 'noopener noreferrer' } : {}),
        },
      };
    },
    img: (_tagName, attribs) => ({
      tagName: 'img',
      attribs: { ...attribs, loading: attribs.loading === 'eager' ? 'eager' : 'lazy' },
    }),
  },
};

export function sanitizeContentHtml(html: unknown): string {
  if (typeof html !== 'string' || !html) return '';
  return sanitizeHtmlLibrary(html, CONTENT_OPTIONS);
}

function trustedHeadHosts(): Set<string> {
  const configured = process.env.CUSTOM_HEAD_ALLOWED_HOSTS?.split(',').map((host) => host.trim().toLowerCase()).filter(Boolean) ?? [];
  return new Set(['www.googletagmanager.com', 'www.google-analytics.com', 'connect.facebook.net', ...configured]);
}

function isTrustedHttpsUrl(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && trustedHeadHosts().has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function sanitizeCustomHeadCode(html: unknown): string {
  if (typeof html !== 'string' || !html.trim()) return '';
  if (html.length > 20_000) throw new Error('كود Head يتجاوز الحد الأقصى المسموح');

  return sanitizeHtmlLibrary(html, {
    allowedTags: ['meta', 'link', 'script'],
    allowedAttributes: {
      meta: ['name', 'property', 'content', 'charset'],
      link: ['rel', 'href', 'as', 'crossorigin', 'type'],
      script: ['src', 'async', 'defer', 'type', 'crossorigin'],
    },
    allowedSchemes: ['https'],
    allowVulnerableTags: true,
    allowProtocolRelative: false,
    disallowedTagsMode: 'discard',
    enforceHtmlBoundary: true,
    exclusiveFilter: (frame) => {
      if (frame.tag === 'meta') {
        return !frame.attribs.name && !frame.attribs.property && !frame.attribs.charset;
      }
      if (frame.tag === 'script') return !isTrustedHttpsUrl(frame.attribs.src);
      if (frame.tag === 'link' && frame.attribs.href) return !isTrustedHttpsUrl(frame.attribs.href);
      return false;
    },
  });
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
