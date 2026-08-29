import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import CarForm from '../../CarForm';

export default async function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
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