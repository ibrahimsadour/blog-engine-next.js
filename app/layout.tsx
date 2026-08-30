import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdminBar from '@/components/AdminBar';
import { db } from '@/lib/db';
import { Toaster } from 'sonner';

export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

  let siteName = '';
  let siteTitle = '';
  let siteDescription = '';

  try {
    const settings = await db.setting.findMany();
    const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value?.trim() || '']));

    siteName = settingsMap['site_name'] || settingsMap['siteName'] || '';
    siteTitle = settingsMap['site_title'] || settingsMap['meta_title'] || siteName;
    siteDescription = settingsMap['site_description'] || settingsMap['meta_description'] || '';
  } catch {
    // في حال عدم توفر الاتصال بقاعدة البيانات
  }

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
    },

    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description: siteDescription,
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
  let headCode = '';

  try {
    const setting = await db.setting.findUnique({
      where: { key: 'custom_head_code' },
    });
    headCode = setting?.value?.trim() || '';
  } catch {
    // في حال عدم توفر الاتصال مؤقتاً
  }

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