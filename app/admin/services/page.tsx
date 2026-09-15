import { db } from '@/lib/db';
import ServicesClient from './ServicesClient';
import Pagination from '@/components/Pagination';

const PAGE_SIZE = 50;

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const requestedPage = Number((await searchParams).page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const [services, count] = await Promise.all([
    db.service.findMany({ orderBy: { sortOrder: 'asc' }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.service.count(),
  ]);
  return <><ServicesClient initialServices={services} /><Pagination page={page} totalPages={Math.ceil(count / PAGE_SIZE)} basePath="/admin/services" /></>;
}
