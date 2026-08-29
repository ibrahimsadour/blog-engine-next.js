import CityForm from '../CityForm';

export default function NewCityPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">إضافة مدينة جديدة</h1>
      <CityForm />
    </div>
  );
}