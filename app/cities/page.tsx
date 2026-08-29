import { db } from '@/lib/db';
import Link from 'next/link';

export default async function CitiesPage() {
  const cities = await db.city.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

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
    </main>
  );
}