import { db } from '@/lib/db';
import ServicesClient from './ServicesClient';

export default async function ServicesPage() {
  const services = await db.service.findMany({ orderBy: { sortOrder: 'asc' } });
  return <ServicesClient initialServices={services} />;
}