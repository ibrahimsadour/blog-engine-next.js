import CarForm from '../CarForm';

export default function NewCarPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">إضافة سيارة جديدة</h1>
      <CarForm />
    </div>
  );
}