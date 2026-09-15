import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdminBar from '@/components/AdminBar';
import { Toaster } from 'sonner';
import { sanitizeCustomHeadCode } from '@/lib/security/content';
import { getSiteUrl } from '@/lib/site-url';
import { getSiteSettings } from '@/lib/settings';

export const revalidate = 300;

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();

  const settings = await getSiteSettings();
  const { siteName, siteTitle, siteDescription } = settings;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteTitle,
      template: siteName ? `%s | ${siteName}` : '%s',
    },
    description: siteDescription,
    applicationName: siteName,
    authors: siteName ? [{ name: siteName }] : undefined,
    generator: 'Next.js',
    referrer: 'origin-when-cross-origin',

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    openGraph: {
      type: 'website',
      locale: 'ar_KW',
      url: siteUrl,
      siteName: siteName || undefined,
      title: siteTitle,
      description: siteDescription,
      images: [{ url: `${siteUrl}/images/og-default.jpg`, width: 1200, height: 630 }],
    },

    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description: siteDescription,
      images: [`${siteUrl}/images/og-default.jpg`],
    },

    formatDetection: {
      email: false,
      address: true,
      telephone: true,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const headCode = sanitizeCustomHeadCode(settings.headCode);

  return (
    <html lang="ar" dir="rtl">
      {headCode && (
        <head
          dangerouslySetInnerHTML={{
            __html: headCode,
          }}
        />
      )}
      <body className="flex min-h-screen flex-col bg-gray-50 font-sans text-gray-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        <Toaster position="top-center" richColors dir="rtl" />
        <AdminBar />
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
