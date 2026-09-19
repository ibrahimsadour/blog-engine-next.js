import { db } from '@/lib/db';
import { isDynamicContentEnabled } from '@/lib/site-profile';
import { notFound } from 'next/navigation';
import ServiceForm from '../../ServiceForm';

export default async function EditServicePage({
  if (!isDynamicContentEnabled()) notFound(); params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const service = await db.service.findUnique({ where: { id: resolvedParams.id } });
  if (!service) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">تعديل خدمة: {service.name}</h1>
      <ServiceForm initialData={service} />
    </div>
  );
}