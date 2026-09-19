import { notFound } from 'next/navigation';
import { isDynamicContentEnabled } from '@/lib/site-profile';
import CityForm from '../CityForm';

export default function NewCityPage() {
  if (!isDynamicContentEnabled()) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">إضافة مدينة جديدة</h1>
      <CityForm />
    </div>
  );
}