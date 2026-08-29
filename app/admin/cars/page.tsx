import { db } from '@/lib/db';
import CarsClient from './CarsClient';

export default async function CarsPage() {
  const cars = await db.car.findMany({ orderBy: { sortOrder: 'asc' } });
  return <CarsClient initialCars={cars} />;
}