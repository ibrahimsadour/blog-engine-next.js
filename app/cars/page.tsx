import { db } from '@/lib/db';
import { Metadata } from 'next';
import Link from 'next/link';
import { buildSiteUrl } from '@/lib/site-url';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'دليل ماركات وأنواع السيارات',
    description: 'تصفح قائمة ماركات السيارات المدعومة واستكشف جميع خدمات الصيانة والإصلاح المتاحة لكل ماركة.',
    alternates: { canonical: buildSiteUrl('cars') },
  };
}

export default async function CarsPage() {
  const cars = await db.car.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <main className="container mx-auto px-4 py-12 space-y-8" dir="rtl">
      <h1 className="text-3xl font-extrabold text-gray-900 text-center">
        اختر ماركة السيارة لعرض الخدمات المتاحة
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cars.map((car) => (
          <Link
            key={car.id}
            href={`/${car.slug}`}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs hover:border-blue-500 hover:shadow-md transition block space-y-2"
          >
            <h2 className="text-xl font-bold text-blue-600">{car.name}</h2>
            <p className="text-gray-600 text-sm line-clamp-2">
              {car.description || `استعرض خدمات صيانة وإصلاح سيارات ${car.name}`}
            </p>
          </Link>
        ))}

        {cars.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            لا توجد ماركات سيارات مضافة ونشطة حالياً.
          </div>
        )}
      </div>
    </main>
  );
}
