import { db } from '@/lib/db';
import CarsClient from './CarsClient';
import { notFound } from 'next/navigation';
import { isAutomotiveSite, isDynamicContentEnabled } from '@/lib/site-profile';

export default async function CarsPage() {
  if (!isDynamicContentEnabled()) notFound();
  if (!isAutomotiveSite()) notFound();
  const cars = await db.car.findMany({ orderBy: { sortOrder: 'asc' } });
  return <CarsClient initialCars={cars} />;
}