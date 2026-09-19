import CarForm from '../CarForm';
import { isDynamicContentEnabled } from '@/lib/site-profile';
import { notFound } from 'next/navigation';
import { isAutomotiveSite } from '@/lib/site-profile';

export default function NewCarPage() {
  if (!isDynamicContentEnabled()) notFound();
  if (!isAutomotiveSite()) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">إضافة سيارة جديدة</h1>
      <CarForm />
    </div>
  );
}