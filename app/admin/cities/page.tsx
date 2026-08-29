import { db } from '@/lib/db';
import CitiesClient from './CitiesClient';

export default async function CitiesPage() {
  const cities = await db.city.findMany({ orderBy: { sortOrder: 'asc' } });
  return <CitiesClient initialCities={cities} />;
}