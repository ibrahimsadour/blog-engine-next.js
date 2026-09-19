import { db } from '@/lib/db';
import { isDynamicContentEnabled } from '@/lib/site-profile';
import { notFound } from 'next/navigation';
import CarForm from '../../CarForm';
import { isAutomotiveSite } from '@/lib/site-profile';

export default async function EditCarPage({
  if (!isDynamicContentEnabled()) notFound(); params }: { params: Promise<{ id: string }> }) {
  if (!isAutomotiveSite()) notFound();
  const resolvedParams = await params;
  const car = await db.car.findUnique({ where: { id: resolvedParams.id } });
  if (!car) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">تعديل سيارة: {car.name}</h1>
      <CarForm initialData={car} />
    </div>
  );
}