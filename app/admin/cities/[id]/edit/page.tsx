import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import CityForm from '../../CityForm';

export default async function EditCityPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const city = await db.city.findUnique({ where: { id: resolvedParams.id } });
  if (!city) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">تعديل المدينة: {city.name}</h1>
      <CityForm initialData={city} />
    </div>
  );
}