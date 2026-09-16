import { db } from '@/lib/db';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildSiteUrl } from '@/lib/site-url';
import Pagination from '@/components/Pagination';

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: 'دليل المدن ومناطق الخدمة',
    description: 'تصفح المدن والمناطق التي تتوفر فيها خدمات الصيانة والمساعدة.',
    alternates: { canonical: buildSiteUrl('cities') },
  };
}

const PAGE_SIZE = 24;

export default async function CitiesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const requestedPage = Number((await searchParams).page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const [cities, count] = await Promise.all([
    db.city.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.city.count({ where: { isActive: true } }),
  ]);

  return (
    <main className="container mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-900 text-center">اختر المدينة لعرض الخدمات المتاحة</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cities.map((city) => (
          <Link
            key={city.id}
            href={`/${city.slug}`}
            className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition block space-y-2"
          >
            <h2 className="text-xl font-bold text-blue-600">{city.name}</h2>
            <p className="text-gray-600 text-sm line-clamp-2">{city.description || `استعرض خدماتنا في ${city.name}`}</p>
          </Link>
        ))}
      </div>
      <Pagination page={page} totalPages={Math.ceil(count / PAGE_SIZE)} basePath="/cities" />
    </main>
  );
}
