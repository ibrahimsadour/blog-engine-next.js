export interface InternalLinkRule {
  keyword: string;
  url: string;
  maxReplacements?: number;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * دالة لحقن الروابط الداخلية تلقائياً داخل نصوص الـ HTML
 * تدعم الكلمات العربية وتتجنب الاستبدال داخل وسوم الروابط الموجودة مسبقاً، العناوين، والصور
 */
export function injectInternalLinks(
  htmlContent: string,
  rules: InternalLinkRule[],
  currentUrl?: string
): string {
  if (!htmlContent || !rules || rules.length === 0) {
    return htmlContent;
  }

  // فلترة القواعد وترتيبها من الأطول إلى الأقصر لضمان دقة الاستبدال
  const validRules = rules
    .filter(
      (r) =>
        r.keyword &&
        r.keyword.trim().length > 1 &&
        r.url &&
        (!currentUrl || r.url !== currentUrl)
    )
    .sort((a, b) => b.keyword.trim().length - a.keyword.trim().length);

  if (validRules.length === 0) {
    return htmlContent;
  }

  // تقسيم الـ HTML إلى كتل وسوم محمية ونصوص عادية
  // نتجاهل الوسوم: a, h1-h6, img, pre, code, script, style وأي وسم HTML عام
  const tagRegex = /<(a|h[1-6]|pre|code|script|style)\b[^>]*>[\s\S]*?<\/\1>|<[^>]+>/gi;

  const segments: { text: string; isTag: boolean }[] = [];
  let lastIndex = 0;
  let match;

  while ((match = tagRegex.exec(htmlContent)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: htmlContent.substring(lastIndex, match.index),
        isTag: false,
      });
    }
    segments.push({
      text: match[0],
      isTag: true,
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < htmlContent.length) {
    segments.push({
      text: htmlContent.substring(lastIndex),
      isTag: false,
    });
  }

  // تطبيق القواعد على المقاطع النصية النقية فقط
  for (const rule of validRules) {
    const { keyword, url, maxReplacements = 1 } = rule;
    let replacementCount = 0;

    const cleanKw = keyword.trim();
    const escapedKw = escapeRegExp(cleanKw);
    
    // مطابقة الكلمة بدعم الأحرف العربية وعلامات الترقيم
    const regex = new RegExp(`(^|[\\s.,!؟،؛:\(\)\[\\]])(${escapedKw})([\\s.,!؟،؛:\(\)\[\\]]|$)`, 'iu');

    for (let i = 0; i < segments.length; i++) {
      if (replacementCount >= maxReplacements) break;
      if (segments[i].isTag) continue;

      if (regex.test(segments[i].text)) {
        segments[i].text = segments[i].text.replace(
          regex,
          `$1<a href="${url}" class="text-blue-600 font-medium underline underline-offset-4 decoration-blue-300 hover:text-blue-800 transition" title="${cleanKw}">$2</a>$3`
        );
        replacementCount++;
      }
    }
  }

  return segments.map((s) => s.text).join('');
}