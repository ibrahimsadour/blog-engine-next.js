#!/usr/bin/env node
// Google PageSpeed Insights mobile lab + field-data diagnostics.
const urls = process.argv.slice(2);
if (!urls.length) {
  console.error('Usage: npm run seo:cwv -- https://your-site.example/page [another-url]');
  process.exit(2);
}
for (const url of urls) {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid protocol');
    const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    endpoint.searchParams.set('url', url);
    endpoint.searchParams.set('strategy', 'mobile');
    endpoint.searchParams.set('category', 'performance');
    if (process.env.PAGESPEED_API_KEY) endpoint.searchParams.set('key', process.env.PAGESPEED_API_KEY);
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(120000) });
    if (!response.ok) throw new Error('PageSpeed HTTP '+response.status+' '+(await response.text()).slice(0,250));
    const report = await response.json();
    const audits = report.lighthouseResult?.audits ?? {};
    const field = report.loadingExperience?.metrics ?? {};
    const result = {
      url,
      mobilePerformanceScore: report.lighthouseResult?.categories?.performance?.score,
      lab: {
        LCP: audits['largest-contentful-paint']?.displayValue,
        CLS: audits['cumulative-layout-shift']?.displayValue,
        TBT: audits['total-blocking-time']?.displayValue,
      },
      field: {
        LCP: field.LARGEST_CONTENTFUL_PAINT_MS?.percentile ?? null,
        INP: field.INTERACTION_TO_NEXT_PAINT?.percentile ?? null,
        CLS: field.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile ?? null,
      },
      note: 'Null field metrics mean no available CrUX field sample; lab TBT is not field INP.',
    };
    console.log(JSON.stringify(result, null, 2));
  } catch(error) {
    console.error(url, String(error));
    process.exitCode = 1;
  }
}
