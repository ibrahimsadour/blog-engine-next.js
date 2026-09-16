import CarForm from '../CarForm';
import { notFound } from 'next/navigation';
import { isAutomotiveSite } from '@/lib/site-profile';

export default function NewCarPage() {
  if (!isAutomotiveSite()) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">إضافة سيارة جديدة</h1>
      <CarForm />
    </div>
  );
}