import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpLeft, Phone } from 'lucide-react';
import { getSiteSettings } from '@/lib/settings';
import { getNavigationData } from '@/lib/navigation';

export default async function Footer() {
  const [{ siteName, siteLogo, phoneNumber, footerDescription, footerContactText }, navigation] =
    await Promise.all([getSiteSettings(), getNavigationData()]);
  const { footerCategories: categories, footerPages } = navigation;

  return (
    <footer className="public-surface border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 pt-12 md:px-8 md:pt-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-5">
            <Link href="/" className="inline-flex rounded-xl bg-white p-3">
              {siteLogo ? (
                <span className="relative block h-12 w-36">
                  <Image src={siteLogo} alt={siteName} fill sizes="144px" className="object-contain" />
                </span>
              ) : <span className="text-xl font-black text-blue-900">{siteName}</span>}
            </Link>
            <p className="max-w-sm text-sm leading-7 text-slate-400">{footerDescription}</p>
          </div>
          {categories.length > 0 && (
            <div>
              <h2 className="mb-5 text-sm font-bold text-white">أقسام الخدمات</h2>
              <ul className="space-y-1 text-sm">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link href={`/category/${category.slug}`} className="inline-flex items-center gap-2 rounded-lg py-2 transition hover:text-sky-300">
                      <ArrowUpLeft size={13} className="shrink-0 text-slate-600" aria-hidden="true" />{category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h2 className="mb-5 text-sm font-bold text-white">معلومات الموقع</h2>
            <ul className="space-y-1 text-sm">
              <li><Link href="/" className="inline-block rounded-lg py-2 transition hover:text-sky-300">الرئيسية</Link></li>
              {footerPages.map((page) => (
                <li key={page.id}><Link href={`/${page.slug}`} className="inline-block rounded-lg py-2 transition hover:text-sky-300">{page.title}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-5 text-sm font-bold text-white">تواصل معنا</h2>
            <p className="text-sm leading-7 text-slate-400">{footerContactText}</p>
            <a href={`tel:${phoneNumber}`} className="public-button mt-5 border border-slate-700 bg-slate-900 text-white hover:bg-slate-800">
              <Phone size={16} aria-hidden="true" />
              <span dir="ltr">{phoneNumber}</span>
            </a>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 py-6 text-xs leading-6 text-slate-400">
          <p>جميع الحقوق محفوظة © {new Date().getFullYear()} {siteName}</p>
          <Link href="/" className="rounded-lg py-1 text-slate-300 hover:text-white">{siteName}</Link>
        </div>
      </div>
    </footer>
  );
}
