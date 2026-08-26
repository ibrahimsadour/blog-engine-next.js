import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdminBar from '@/components/AdminBar';
import { db } from '@/lib/db';
import { Toaster } from 'sonner';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'دليل الخدمات السريعة في الكويت',
    template: '%s | دليل الخدمات',
  },
  description: 'دليل خدمات متكامل لصيانة وتبديل البطاريات وخدمات المساعدة على الطريق في الكويت على مدار 24 ساعة',
  applicationName: 'دليل الخدمات',
  authors: [{ name: 'فريق العمل' }],
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  
  // توجيهات عناكب البحث المتقدمة
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

  // Open Graph الأساسي للموقع
  openGraph: {
    type: 'website',
    locale: 'ar_KW',
    url: siteUrl,
    siteName: 'دليل الخدمات',
    title: 'دليل الخدمات السريعة في الكويت',
    description: 'دليل خدمات متكامل لصيانة وتبديل البطاريات وخدمات المساعدة على الطريق في الكويت 24 ساعة',
  },

  // بطاقات تويتر
  twitter: {
    card: 'summary_large_image',
    title: 'دليل الخدمات السريعة في الكويت',
    description: 'دليل خدمات متكامل لصيانة وتبديل البطاريات وخدمات المساعدة على الطريق في الكويت 24 ساعة',
  },

  // تحسين التنسيقات للأجهزة الذكية
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
};

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
    headCode = setting?.value || '';
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