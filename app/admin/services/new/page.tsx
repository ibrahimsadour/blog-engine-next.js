import { notFound } from 'next/navigation';
import { isDynamicContentEnabled } from '@/lib/site-profile';
import ServiceForm from '../ServiceForm';

export default function NewServicePage() {
  if (!isDynamicContentEnabled()) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">إضافة خدمة جديدة</h1>
      <ServiceForm />
    </div>
  );
}