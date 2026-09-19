import { notFound } from 'next/navigation';
import { isDynamicContentEnabled } from '@/lib/site-profile';
import { db } from '@/lib/db';
import CitiesClient from './CitiesClient';
import Pagination from '@/components/Pagination';

const PAGE_SIZE = 50;

export default async function CitiesPage({
  if (!isDynamicContentEnabled()) notFound(); searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const requestedPage = Number((await searchParams).page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const [cities, count] = await Promise.all([
    db.city.findMany({ orderBy: { sortOrder: 'asc' }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.city.count(),
  ]);
  return <><CitiesClient initialCities={cities} /><Pagination page={page} totalPages={Math.ceil(count / PAGE_SIZE)} basePath="/admin/cities" /></>;
}
