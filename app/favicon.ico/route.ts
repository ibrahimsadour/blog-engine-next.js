import { getSiteSettings } from '@/lib/settings';
import { getSiteIconUrl } from '@/lib/site-icon';

export const dynamic = 'force-dynamic';

// Browsers requesting the conventional URL must see the current saved icon too.
export async function GET() {
  const { siteIcon, siteIconVersion } = await getSiteSettings();
  return new Response(null, {
    status: 307,
    headers: {
      Location: getSiteIconUrl(siteIcon, siteIconVersion),
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
