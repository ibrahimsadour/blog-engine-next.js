import { db } from '@/lib/db';
import { isDynamicContentEnabled } from '@/lib/site-profile';
import CarsClient from './CarsClient';
import { notFound } from 'next/navigation';
import { isAutomotiveSite } from '@/lib/site-profile';

export default async function CarsPage() {
  if (!isDynamicContentEnabled()) notFound();
  if (!isAutomotiveSite()) notFound();
  const cars = await db.car.findMany({ orderBy: { sortOrder: 'asc' } });
  return <CarsClient initialCars={cars} />;
}